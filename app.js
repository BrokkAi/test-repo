class PixelArtEditor {
    constructor() {
        this.canvas = document.getElementById('pixelCanvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.colorPicker = document.getElementById('colorPicker');
        this.brushSize = document.getElementById('brushSize');
        this.gridSizeSelect = document.getElementById('gridSize');
        this.clearBtn = document.getElementById('clearBtn');
        this.fillBtn = document.getElementById('fillBtn');
        this.gridToggle = document.getElementById('gridToggle');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.pixelInfo = document.getElementById('pixelInfo');
        
        this.gridSize = 32;
        this.pixelSize = 16;
        this.isDrawing = false;
        this.showGrid = true;
        this.pixels = {};
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.render();
    }
    
    setupCanvas() {
        const size = this.gridSize * this.pixelSize;
        this.canvas.width = size;
        this.canvas.height = size;
        this.pixels = {};
        this.render();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        this.clearBtn.addEventListener('click', () => this.clear());
        this.fillBtn.addEventListener('click', () => this.fill());
        this.gridToggle.addEventListener('click', () => this.toggleGrid());
        this.downloadBtn.addEventListener('click', () => this.download());
        
        this.gridSizeSelect.addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
            this.setupCanvas();
        });
        
        const presetColors = document.querySelectorAll('.preset-color');
        presetColors.forEach(btn => {
            btn.addEventListener('click', () => {
                this.colorPicker.value = btn.dataset.color;
            });
        });
    }
    
    getPixelCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = Math.floor((e.clientX - rect.left) * scaleX / this.pixelSize);
        const y = Math.floor((e.clientY - rect.top) * scaleY / this.pixelSize);
        
        return { x, y };
    }
    
    handleMouseDown(e) {
        this.isDrawing = true;
        const isErasing = e.button === 2;
        const { x, y } = this.getPixelCoords(e);
        this.drawPixel(x, y, isErasing);
    }
    
    handleMouseMove(e) {
        const { x, y } = this.getPixelCoords(e);
        this.pixelInfo.textContent = `Position: (${x}, ${y})`;
        
        if (this.isDrawing) {
            const isErasing = e.buttons === 2;
            this.drawPixel(x, y, isErasing);
        }
    }
    
    handleMouseUp() {
        this.isDrawing = false;
    }
    
    drawPixel(x, y, erase = false) {
        const size = parseInt(this.brushSize.value);
        const offset = Math.floor(size / 2);
        
        for (let dx = 0; dx < size; dx++) {
            for (let dy = 0; dy < size; dy++) {
                const px = x - offset + dx;
                const py = y - offset + dy;
                
                if (px >= 0 && px < this.gridSize && py >= 0 && py < this.gridSize) {
                    const key = `${px},${py}`;
                    if (erase) {
                        delete this.pixels[key];
                    } else {
                        this.pixels[key] = this.colorPicker.value;
                    }
                }
            }
        }
        
        this.render();
    }
    
    clear() {
        this.pixels = {};
        this.render();
    }
    
    fill() {
        const color = this.colorPicker.value;
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                this.pixels[`${x},${y}`] = color;
            }
        }
        this.render();
    }
    
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.gridToggle.classList.toggle('active');
        this.render();
    }
    
    render() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const [key, color] of Object.entries(this.pixels)) {
            const [x, y] = key.split(',').map(Number);
            this.ctx.fillStyle = color;
            this.ctx.fillRect(
                x * this.pixelSize,
                y * this.pixelSize,
                this.pixelSize,
                this.pixelSize
            );
        }
        
        if (this.showGrid) {
            this.ctx.strokeStyle = '#e0e0e0';
            this.ctx.lineWidth = 1;
            
            for (let i = 0; i <= this.gridSize; i++) {
                const pos = i * this.pixelSize;
                
                this.ctx.beginPath();
                this.ctx.moveTo(pos, 0);
                this.ctx.lineTo(pos, this.canvas.height);
                this.ctx.stroke();
                
                this.ctx.beginPath();
                this.ctx.moveTo(0, pos);
                this.ctx.lineTo(this.canvas.width, pos);
                this.ctx.stroke();
            }
        }
    }
    
    download() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        for (const [key, color] of Object.entries(this.pixels)) {
            const [x, y] = key.split(',').map(Number);
            tempCtx.fillStyle = color;
            tempCtx.fillRect(
                x * this.pixelSize,
                y * this.pixelSize,
                this.pixelSize,
                this.pixelSize
            );
        }
        
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `pixel-art-${timestamp}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PixelArtEditor();
});
