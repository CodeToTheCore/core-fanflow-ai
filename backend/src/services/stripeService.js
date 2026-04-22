const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
 
/**
 * Create a Stripe customer for an artist
 */
async function createCustomer(artist) {
  const customer = await stripe.customers.create({
    email: artist.email,
    name: artist.name,
    metadata: { artistId: String(artist.id) },
  })
  return customer
}
 
/**
 * Create a checkout session for Pro subscription
 */
async function createCheckoutSession(customerId, artistId) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'FanFlow AI Pro',
            description: 'Unlimited campaigns, AI manager, auto-apply to gigs',
          },
          unit_amount: 1900, // $19/month
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.FRONTEND_URL}/settings`,
    metadata: { artistId: String(artistId) },
  })
  return session
}
 
/**
 * Create a payment link for artist campaigns
 * (artist can use this to collect money from fans)
 */
async function createArtistPaymentLink({ amount, description, artistName }) {
  const product = await stripe.products.create({
    name: description,
    metadata: { artistName },
  })
 
  const price = await stripe.prices.create({
    unit_amount: amount * 100, // convert to cents
    currency: 'usd',
    product: product.id,
  })
 
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
  })
 
  return paymentLink.url
}
 
/**
 * Handle Stripe webhooks
 */
async function handleWebhook(rawBody, signature) {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )
 
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const artistId = session.metadata?.artistId
      // Update artist plan to 'pro' in DB
      return { artistId, action: 'upgrade_to_pro' }
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      // Downgrade artist
      return { customerId: sub.customer, action: 'downgrade_to_free' }
    }
    default:
      return { action: 'ignored', type: event.type }
  }
}
 
module.exports = { createCustomer, createCheckoutSession, createArtistPaymentLink, handleWebhook }
 