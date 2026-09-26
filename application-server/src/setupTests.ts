// Dummy, syntactically-valid Clerk test keys so clerkMiddleware() can
// initialize without hitting the network or requiring a real Clerk project.
process.env.CLERK_SECRET_KEY ??= 'sk_test_0000000000000000000000000000000000000000'
process.env.CLERK_PUBLISHABLE_KEY ??= 'pk_test_dGVzdC5jbGVyay5hY2NvdW50cy5kZXYk'
