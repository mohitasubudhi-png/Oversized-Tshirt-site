const stripe = require('stripe')('sk_test_51TbKO7K3WBK49D6oB4UHFnn5n6U2gFfhy4f5djhZm1ZKUuCpbbU9Bl51b3ISR23hBXVPKyK0wa2idS1WFtxNfRCn00nG6VI468');

module.exports = async (req, res) => {
    // Enable CORS for local testing vs live deployment
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { cart } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Format line items for Stripe
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${item.name} - Size ${item.size}`,
                    images: [item.img],
                },
                unit_amount: Math.round(parseFloat(item.price) * 100), // Stripe expects cents
            },
            quantity: item.qty,
        }));

        // Calculate total to see if they qualify for free shipping ($150 threshold)
        const totalAmount = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
        
        let shippingOptions = [];
        if (totalAmount >= 150) {
            shippingOptions = [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: { amount: 0, currency: 'usd' },
                        display_name: 'Free VIP Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 3 },
                            maximum: { unit: 'business_day', value: 5 },
                        },
                    },
                }
            ];
        } else {
            shippingOptions = [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: { amount: 800, currency: 'usd' }, // $8 shipping
                        display_name: 'Standard Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 5 },
                            maximum: { unit: 'business_day', value: 7 },
                        },
                    },
                }
            ];
        }

        // Create Checkout Session
        // Note: req.headers.origin or host will dynamically set the success/cancel URLs
        const origin = req.headers.origin || `https://${req.headers.host}`;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU'],
            },
            shipping_options: shippingOptions,
            line_items: lineItems,
            mode: 'payment',
            success_url: `${origin}/index.html?success=true`,
            cancel_url: `${origin}/index.html?canceled=true`,
        });

        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
};
