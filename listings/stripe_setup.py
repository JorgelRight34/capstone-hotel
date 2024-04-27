import stripe

stripe.api_key = 'sk_test_51P45ndHuJC7kQ0L2IJdTRqLmi7upVqQKBc6dMnmbPCecZo634A1r76z9O2zB6fzOir09qWBYE5VVff4xD4u6g5El00kfRWD0ZR'

starter_subscription = stripe.Product.create(
  name="Starter Subscription",
  description="$12/Month subscription",
)

starter_subscription_price = stripe.Price.create(
  unit_amount=1200,
  currency="usd",
  recurring={"interval": "month"},
  product=starter_subscription['id'],
)

# Save these identifiers
print(f"Success! Here is your starter subscription product id: {starter_subscription.id}")
print(f"Success! Here is your starter subscription price id: {starter_subscription_price.id}")