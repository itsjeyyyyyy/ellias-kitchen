(function () {
    emailjs.init("Z6txgHjrhG5bF7Qv2");
})();

// CART VARIABLES

let cart = [];
let subtotal = 0;
let deliveryFee = 0;
let total = 0;

// DELIVERY FEES

const fees = {
    "Metro Manila": 60,
    "North Luzon": 150,
    "South Luzon": 60,
    "Visayas": 180,
    "Mindanao": 220,
    "Remote Area": 250
};

// REGION DETECTION

function detectRegion(location) {

    const loc = location.toLowerCase();

    // METRO MANILA

    const metroManila = [
        "manila",
        "quezon city",
        "qc",
        "pasig",
        "taguig",
        "makati",
        "parañaque",
        "paranaque",
        "las piñas",
        "las pinas",
        "muntinlupa",
        "pasay",
        "marikina",
        "caloocan",
        "malabon",
        "navotas",
        "valenzuela",
        "mandaluyong",
        "san juan",
        "pateros"
    ];

    // NORTH LUZON

    const northLuzon = [
        "pangasinan",
        "la union",
        "ilocos",
        "benguet",
        "cagayan",
        "isabela",
        "nueva vizcaya",
        "quirino",
        "aurora",
        "bataan",
        "zambales",
        "tarlac",
        "nueva ecija",
        "bulacan"
    ];

    // SOUTH LUZON

    const southLuzon = [
        "laguna",
        "batangas",
        "quezon",
        "rizal",
        "cavite",
        "occidental mindoro",
        "oriental mindoro",
        "marinduque",
        "romblon",
        "palawan",
        "albay",
        "camarines",
        "sorsogon",
        "masbate"
    ];

    // VISAYAS

    const visayas = [
        "cebu",
        "iloilo",
        "bacolod",
        "negros",
        "leyte",
        "samar",
        "bohol",
        "capiz",
        "aklan",
        "guimaras",
        "antique",
        "siquijor"
    ];

    // MINDANAO

    const mindanao = [
        "davao",
        "bukidnon",
        "cagayan de oro",
        "misamis",
        "zamboanga",
        "surigao",
        "agusan",
        "cotabato",
        "sultan kudarat",
        "lanao",
        "maguindanao",
        "sarangani"
    ];

    // DETECTION

    if (metroManila.some(place => loc.includes(place))) {
        return "Metro Manila";
    }

    if (northLuzon.some(place => loc.includes(place))) {
        return "North Luzon";
    }

    if (southLuzon.some(place => loc.includes(place))) {
        return "South Luzon";
    }

    if (visayas.some(place => loc.includes(place))) {
        return "Visayas";
    }

    if (mindanao.some(place => loc.includes(place))) {
        return "Mindanao";
    }

    return "Remote Area";
}

// UPDATE TOTALS

function updateTotal() {

    total = subtotal + deliveryFee;

    document.getElementById("subtotal").innerText = subtotal;

    document.getElementById("deliveryFee").innerText = deliveryFee;

    document.getElementById("total").innerText = total;
}

// ADD TO CART

function addToCart(product, price) {

    cart.push({ product, price });

    subtotal += price;

    const list = document.getElementById("cart-items");

    const item = document.createElement("li");

    item.innerText = `${product} - ₱${price}`;

    list.appendChild(item);

    updateTotal();
}

// MAKE GLOBAL

window.addToCart = addToCart;

// AUTO DETECT REGION

document.getElementById("cityProvince").addEventListener("input", function () {

    const location = this.value;

    const region = detectRegion(location);

    document.getElementById("deliveryArea").value = region;

    deliveryFee = fees[region];

    updateTotal();
});

// PAYMENT METHOD

document.getElementById("payment").addEventListener("change", function () {

    const gcashSection = document.getElementById("gcashSection");

    if (this.value === "GCash") {

        gcashSection.style.display = "block";

    } else {

        gcashSection.style.display = "none";
    }
});

// GENERATE TRACKING NUMBER

function generateTrackingNumber() {

    const random = Math.floor(1000 + Math.random() * 9000);

    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `EK-${year}${month}${day}-${random}`;
}

// ORDER SUBMISSION

document.getElementById("orderForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    if (cart.length === 0) {

        alert("Please add items to cart.");

        return;
    }

    const trackingNumber = generateTrackingNumber();

    const name = document.getElementById("name").value;

    const email = document.getElementById("email").value;

    const streetAddress = document.getElementById("streetAddress").value;

    const cityProvince = document.getElementById("cityProvince").value;

    const phone = document.getElementById("phone").value;

    const payment = document.getElementById("payment").value;

    const deliveryArea = document.getElementById("deliveryArea").value;

    const fullAddress = `${streetAddress}, ${cityProvince}`;

    const orderDetails = cart.map(item =>
        `${item.product} - ₱${item.price}`
    ).join(", ");

    try {

        // SAVE TO FIREBASE

        await addDoc(collection(db, "orders"), {

            trackingNumber: trackingNumber,

            customerName: name,

            customerEmail: email,

            customerAddress: fullAddress,

            customerPhone: phone,

            deliveryArea: deliveryArea,

            paymentMethod: payment,

            cart: cart,

            subtotal: subtotal,

            deliveryFee: deliveryFee,

            total: total,

            status: "Processing",

            createdAt: new Date()
        });

        // CUSTOMER EMAIL

        await emailjs.send(

            "service_423278l",

            "template_2gb5z9m",

            {

                customer_name: name,

                customer_email: email,

                customer_phone: phone,

                customer_address: fullAddress,

                payment_method: payment,

                delivery_area: deliveryArea,

                order_details: orderDetails,

                order_total: total,

                tracking_number: trackingNumber,

                order_status: "Processing"
            }
        );

        // ADMIN EMAIL

        await emailjs.send(

            "service_423278l",

            "template_aihypaa",

            {

                customer_name: name,

                customer_email: email,

                customer_phone: phone,

                customer_address: fullAddress,

                payment_method: payment,

                delivery_area: deliveryArea,

                order_details: orderDetails,

                order_total: total,

                tracking_number: trackingNumber,

                order_status: "Processing"
            }
        );

        alert(
            `Order submitted successfully!\n\nTracking Number:\n${trackingNumber}`
        );

        // RESET

        cart = [];
        subtotal = 0;
        deliveryFee = 0;
        total = 0;

        document.getElementById("cart-items").innerHTML = "";

        updateTotal();

        this.reset();

        document.getElementById("deliveryArea").value = "";

        document.getElementById("gcashSection").style.display = "none";

    } catch (error) {

        console.error(error);

        alert("Error submitting order.");
    }
});

// TRACK ORDER

async function trackOrder() {

    const tracking = document.getElementById("trackingNumber").value;

    const result = document.getElementById("trackingResult");

    if (tracking.trim() === "") {

        result.innerHTML = "<p>Please enter a tracking number.</p>";

        return;
    }

    try {

        const q = query(

            collection(db, "orders"),

            where("trackingNumber", "==", tracking)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {

            result.innerHTML = "<p>Tracking number not found.</p>";

            return;
        }

        querySnapshot.forEach((doc) => {

            const order = doc.data();

            let createdTime;

            if (order.createdAt.seconds) {

                createdTime = order.createdAt.seconds * 1000;

            } else {

                createdTime = new Date(order.createdAt).getTime();
            }

            const currentTime = new Date().getTime();

            const hoursPassed =
                (currentTime - createdTime) / (1000 * 60 * 60);

            let automaticStatus = "Processing";

            if (hoursPassed >= 24) {

                automaticStatus =
                    "Shipped - Check Email for Tracking Number";

            } else if (hoursPassed >= 12) {

                automaticStatus = "Preparing to Ship";
            }

            result.innerHTML = `

                <div style="margin-top:20px;">

                    <h3>Order Found</h3>

                    <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>

                    <p><strong>Status:</strong> ${automaticStatus}</p>

                    <p><strong>Customer:</strong> ${order.customerName}</p>

                    <p><strong>Address:</strong> ${order.customerAddress}</p>

                    <p><strong>Total:</strong> ₱${order.total}</p>

                </div>
            `;
        });

    } catch (error) {

        console.error(error);

        result.innerHTML =
            "<p>Error retrieving tracking information.</p>";
    }
}

// MAKE GLOBAL

window.trackOrder = trackOrder;