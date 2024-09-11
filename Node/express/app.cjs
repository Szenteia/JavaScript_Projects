const express = require('express');
//create an express application
const app = express();
//for parsing json objects in the body of the request, add a piece of middleware!
app.use(express.json());

const courses = [
    {id: 1, name: 'course1'},
    {id: 2, name: 'course2'},
    {id: 3, name: 'course3'}
];

app.get('/', (req, res) => {
    res.send('Hello Reader, ó... The emptyness machine');//call back function === route handler
});

app.get("/api/mylist", (req, res) => {
    res.send(['alma','körte','banán']);
});
//get all courses
app.get("/api/courses", (req, res) => {
    res.send(courses);
});
//get single course by id, if not found return 404
app.get("/api/courses/:id", (req,res) =>
{
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) res.status(404).send('The course with the given ID was not found');
  res.send(course);
});

app.post("/api/courses", (req,res) => {
    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
})


//env variable
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
