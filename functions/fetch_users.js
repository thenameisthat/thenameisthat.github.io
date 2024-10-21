export async function onRequest(context) {
  try {
    // Access D1 instance using the binding
    const db = context.env.D1_DATABASE;

    // Run a SQL query
    const { results } = await db.prepare("SELECT * FROM userinfo").all();

    // Return the results as JSON
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response("Error: " + error.message, { status: 500 });
  }
}
