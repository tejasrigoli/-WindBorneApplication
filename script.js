const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

canvas.width = 800;
canvas.height = 400;

if (!gl) {
    alert("WebGL not supported");
}

// Vertex and Fragment Shaders
const vertexShaderSrc = `
    attribute vec2 aPosition;
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const fragmentShaderSrc = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(0, 0, 0, 1);
    }
`;

function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const vertexShader = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const aPosition = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

let points = [];
let lineWidth = 2;

function pixelToNDC(x, y) {
    return [
        (x / canvas.width) * 2 - 1,
        (canvas.height - y) / canvas.height * 2 - 1
    ];
}

function drawThickLines() {
    const vertices = [];
    for (let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];

        const dx = y2 - y1;
        const dy = x1 - x2;
        const length = Math.sqrt(dx * dx + dy * dy);

        const offsetX = (dx / length) * (lineWidth / canvas.width);
        const offsetY = (dy / length) * (lineWidth / canvas.height);

        vertices.push(
            x1 - offsetX, y1 - offsetY,
            x1 + offsetX, y1 + offsetY,
            x2 - offsetX, y2 - offsetY,
            x2 + offsetX, y2 + offsetY
        );
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 2);
}

function addUserPoint() {
    const xInput = document.getElementById('xCoord').value;
    const yInput = document.getElementById('yCoord').value;
    if (xInput && yInput) {
        const x = parseFloat(xInput);
        const y = parseFloat(yInput);
        points.push(pixelToNDC(x, y));
        drawThickLines();
    }
}

function addRandomSegment() {
    const newX = Math.random() * canvas.width;
    const newY = Math.random() * canvas.height;
    points.push(pixelToNDC(newX, newY));
    drawThickLines();
}

document.getElementById('lineWidth').addEventListener('input', (event) => {
    lineWidth = parseInt(event.target.value);
    drawThickLines();
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const [x, y] = pixelToNDC(event.clientX - rect.left, event.clientY - rect.top);
    points.push([x, y]);
    drawThickLines();
});

gl.clearColor(1, 1, 1, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
