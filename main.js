document.addEventListener("DOMContentLoaded", async () => {
    const courseList = document.getElementById("courseList");
    const response = await fetch("http://localhost:5000/api/courses");
    const courses = await response.json();

    courses.forEach(course => {
        const courseCard = `
            <div class="col-md-4">
                <div class="card">
                    <img src="${course.image}" class="card-img-top" alt="${course.title}">
                    <div class="card-body">
                        <h5 class="card-title">${course.title}</h5>
                        <p class="card-text">${course.description}</p>
                        <a href="#" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            </div>
        `;
        courseList.innerHTML += courseCard;
    });
});
