// SPACE CONSTANTS

const AU = 149.6e6 * 1000 // mult by 1000 to get meters
const G = 6.67428e-11
const SCALE = 250 / AU // 1 AU = 100 pixels
const TIMESTEP = 3600*24 // 1 day

class Vector {
    x;
    y;
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }
}

class SpaceObject {
    mass;     // double
    color;    // str
    volume;   // double
    position; // vector
    velocity; // vector
    trailColor;
    radius;

    constructor(mass, volume, position, velocity, radius, color, trailColor='rgba(0,0,0,0)') {
        this.mass = mass;
        this.volume = volume;
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.trailColor = trailColor;
        this.radius = radius;
    }

    attraction(other) {
        let other_x = other.position.x;
        let other_y = other.position.y;

        let distance_x = this.position.x - other_x;
        let distance_y = this.position.y - other_y;

        let distance = Math.sqrt(distance_x * distance_x + distance_y * distance_y);

        let force = G * this.mass * other.mass / (distance * distance)
        let theta = Math.atan2(distance_y, distance_x);
        let force_x = Math.cos(theta) * force;
        let force_y = Math.sin(theta) * force;

        return new Vector(force_x, force_y);
    }

    updatePosition(solarSystem, simulation) {
        let total_fx = 0;
        let total_fy = 0;

        for (const obj of solarSystem.objects) {
            if (this === obj) continue

            let force = this.attraction(obj)
            total_fx += force.x * TIMESTEP;
            total_fy += force.y * TIMESTEP;
        }

        this.velocity.x -= total_fx / this.mass
        this.velocity.y -= total_fy / this.mass
        
        this.position.x += this.velocity.x * simulation.getDeltaTime() * TIMESTEP;
        this.position.y += this.velocity.y * simulation.getDeltaTime() * TIMESTEP;

        console.log(this.position)
    }
}

class SolarSystem {
    name;
    objects; // objects in the solar system

    constructor(name='Solar System (default)') {
        this.name = name;
        this.objects = [];
    }
}

class Simulation {
    canvas;
    HEIGHT;
    WIDTH;
    UNIT_WIDTH;
    FPS;
    solarSystem;
    ctx;
    pastTime = new Date().getTime() / 1000;
    currTime = new Date().getTime() / 1000;

    constructor(canvas, UNIT_WIDTH, FPS) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.UNIT_WIDTH = UNIT_WIDTH;
        this.FPS = FPS;
    }

    updateTimePerFrame() {
        this.pastTime = this.currTime;
        this.currTime = new Date().getTime() / 1000;
    }

    getDeltaTime() {
        return this.currTime - this.pastTime;
    }

    start() {
        this.setup();
        setTimeout(() => this.loop(), 1000 / FPS);
    }

    setup() {
        this.HEIGHT = document.body.clientHeight;
        this.WIDTH = document.body.clientWidth;

        canvas.height = this.HEIGHT;
        canvas.width = this.WIDTH;
        canvas.style.height = this.HEIGHT;
        canvas.style.width = this.WIDTH;

        canvas.style.backgroundColor = 'black';

        this.setupSolarSystem();
        this.setupObjects();
    }

    setupSolarSystem() {
        this.solarSystem = new SolarSystem("THE HENRY SOLAR SYSTEM WOOOOO");
    }

    setupObjects() {
        // mass in proportion to the earth
        let sun = new SpaceObject(333000, 1304000, new Vector(Math.floor(this.WIDTH / 2), Math.floor(this.HEIGHT / 2)), new Vector(0, 0), 80, 'orange');
        let earth = new SpaceObject(1, 1, new Vector(450, 450), new Vector(0.001, 0.0018), 10, 'green');

        let moon = new SpaceObject(0.0002, 0.5, new Vector(455, 455), new Vector(0.0015, 0.00179), 5, "white")
        
        this.solarSystem.objects.push(sun);
        this.solarSystem.objects.push(earth);
        this.solarSystem.objects.push(moon)
    }

    resetScreen() {
        this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    }

    updateFrame() {
        for (const obj of this.solarSystem.objects) {
            this.ctx.fillStyle = obj.color;
            this.ctx.beginPath();
            this.ctx.arc(obj.position.x, obj.position.y, obj.radius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();

            obj.updatePosition(this.solarSystem, this);
        }

        this.updateTimePerFrame();
    }

    loop() {
        this.resetScreen();
        this.updateFrame();
        setTimeout(() => this.loop(), 1000 / FPS);
    }
}

const canvas = document.getElementById("canvas")

// define all constants
const UNIT_WIDTH = 10;
const FPS = 60;

let simulation = new Simulation(canvas, UNIT_WIDTH, FPS);
simulation.start()
