// Get canvas and WebGL context
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// Set canvas dimensions
canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight - 120;

if (!gl) {
    alert('WebGL not supported');
}

// Vertex shader
const vertexShaderSrc = `
    attribute vec2 aPosition;
    uniform float uLineWidth;
    void main() {
        gl_PointSize = uLineWidth;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

// Fragment shader
const fragmentShaderSrc = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(0.0, 0.5, 0.8, 1.0);
    }
`;

// Compile shader function
function compileShader(src, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create shaders
const vertexShader = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);

// Create program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Set up buffer and attributes
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const aPosition = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

const uLineWidth = gl.getUniformLocation(program, 'uLineWidth');

// Variables to hold line data
let points = [];
let lineWidth = 2;

// Function to draw the line
function drawLine() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.uniform1f(uLineWidth, lineWidth);

    gl.drawArrays(gl.LINE_STRIP, 0, points.length / 2);
}

// Handle adding a random point
function addRandomPoint() {
    const x = (Math.random() * 2) - 1;
    const y = (Math.random() * 2) - 1;
    points.push(x, y);
    drawLine();
}

// Handle line width change
document.getElementById('lineWidth').addEventListener('input', (event) => {
    lineWidth = event.target.value;
    drawLine();
});

// Handle click to add points
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / canvas.width * 2 - 1;
    const y = (rect.bottom - event.clientY) / canvas.height * 2 - 1;
    points.push(x, y);
    drawLine();
});

// Initialize with one random point
addRandomPoint();
