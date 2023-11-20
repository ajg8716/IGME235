const lifeworld = {

    init(numCols,numRows){
        this.numCols = numCols,
        this.numRows = numRows,
        this.world = this.buildArray();
        this.worldBuffer = this.buildArray();
        this.randomSetup();
    },

    buildArray(){
        let outerArray = [];
        for(let row = 0; row < this.numRows; row++){
            let innerArray = [];
            for (let col = 0; col < this.numCols; col++) {
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        return outerArray;
    },

    randomSetup(){
        for(let row = 0; row < this.numRows; row++){
            for(let col = 0; col < this.numCols; col++) {
                this.world[row][col] = 0;
                if(Math.random() < .1) {
                    this.world[row][col] = 1;
                }
            }
        }
    },

    getLivingNeighbors(row,col){
		// TODO:
        let count = 0;
		// row and col should > than 0, if not return 0

        // count up how many neighbors are alive at N,NE,E,SE,S,SW,W,SE - use this.world[row][col-1] etc
        const neighbors = [
            [-1, 0], // N
            [-1, 1], // NE
            [0, 1], // E
            [1, 1], // SE
            [1, 0], // S
            [1, -1], // SW
            [0, -1], // W
            [-1, -1], // NW
        ];

        for (const [dRow, dCol] of neighbors){
            const nRow = row + dRow;
            const nCol = col + dCol;

            if ( !(dRow === 0 && dCol === 0) && nRow >= 0 && nCol >= 0 && nRow < this.numRows && nCol < this.numCols&& this.world[nRow][nCol] === 1) {
                 count++;
            }
        }

		// return that sum
        return count;

	},
	
step(){
	// TODO:
	
	// nested for loop will call getLivingNeighbors() on each cell in this.world
    for (let row = 1; row < this.numRows - 1; row++){
        for(let col = 1; col < this.numCols - 1; col++){
            const neighborsAlive = this.getLivingNeighbors(row, col);
    // Determine if that cell in the next generation should be alive (see wikipedia life page linked at top)
    // Put a 1 or zero into the right location in this.worldBuffer
            if(this.world[row][col] === 1){
                if(neighborsAlive < 2 || neighborsAlive > 3) {
                    this.worldBuffer[row][col] = 0;
                }else{
                    this.worldBuffer[row][col] = 1;
                }
            } else {
                if(neighborsAlive === 3){
                    this.worldBuffer[row][col] = 1;
                }
                else{
                    this.worldBuffer[row][col] = 0;
                }
            }
        }
    }
	
	// when the looping is done, swap .world and .worldBuffer (use a temp variable to do so)
    const temp = this.world;
    this.world = this.worldBuffer;
    this.worldBuffer = temp;
}
}