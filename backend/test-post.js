const fetch = require("node-fetch");

async function test() {
  const response = await fetch("http://localhost:5000/api/vehicles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "BMW 7 Series",
      brand: "BMW",
      category: "Luxury Sedan",
      description: "Luxury executive sedan",
      image_url: "https://example.com/bmw7.jpg",
      passenger_capacity: 3,
      luggage_capacity: 2,
      starting_price: 180,
      available: true,
    }),
  });

  const data = await response.json();
  console.log(data);
}

test();