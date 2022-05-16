let availableMilk = 0;
let availableCacao = 0;

const onBucketReady = (bucket) => {
    console.log('Bucket has been filled, capacity:', bucket.capacity, 'milk', bucket.milk, 'cacao', bucket.cacao);
}

class Machine {
    constructor() {
        
    }

    waitForSupply = (ms) => new Promise((res) => setTimeout(res, ms));
    
    addMilk(amount) {
        availableMilk += Math.round(amount);
    }
    addCacao(amount) {
        availableCacao += Math.round(amount);
    }
    
    // fill bucket1 with milk and start filling bucket2 with the left milk
    async fillBucketWithMilk (bucket1, bucket2) {
        try {
            const neededMilk = bucket1.capacity * 0.8; // milk needed to fill bucket1

            // while the available milk isn't enough, keep adding it to the bucket and wait for supply
            while (availableMilk < (neededMilk - bucket1.milk)) {
                bucket1.milk += availableMilk;
                availableMilk = 0;
                await this.waitForSupply(100); // wait for the supply of milk to come
            } 
            
            // available milk is enough fill the bucket1 with milk
            if (availableMilk >= (neededMilk - bucket1.milk)) {
                availableMilk -= (neededMilk - bucket1.milk);
                bucket1.milk = neededMilk;
                // check if bucket1 was the last
                if (bucket2 != undefined) {
                    // if the left milk is enough to fill the bucket2, fill it
                    if (availableMilk >= bucket2.capacity * 0.8) {
                        bucket2.milk = bucket2.capacity * 0.8;
                        availableMilk -= bucket2.milk;
                    } else {
                        // if the available milk is not enough, still add all the available milk to bucket2
                        bucket2.milk += availableMilk;
                        availableMilk = 0; 
                    }
                }
            }

            // if bucket1 has necessary amount of milk, return resolved promise with the true
            if (bucket1.milk == neededMilk)
                return true;
            return false;
        } catch (error) {
            // return rejected promise with the error
            throw new Error(error.message);
        }
    }
    
    
    // fill bucket1 with cacao and start filling bucket2 with the left cacao
    async fillBucketWithCacao (bucket1, bucket2) {
        try {
            const neededCacao = bucket1.capacity * 0.2; // cacao needed to fill the bucket

            // keep adding available cacao, while it isn't enough to fill the bucket
            while (availableCacao < (neededCacao - bucket1.cacao)) {
                bucket1.cacao += availableCacao;
                availableCacao = 0;
                await this.waitForSupply(100); // wait for cacao supply to come 
            }

            // availabale cacao is enough to fill the bucket
            if (availableCacao >= (neededCacao - bucket1.cacao)) {
                availableCacao -= (neededCacao - bucket1.cacao);
                bucket1.cacao = neededCacao;
                // check if bucket1 was the last
                if (bucket2 != undefined) {    
                    // if the left cacao is enough to fill the bucket2, fill it
                    if (availableCacao >= bucket2.capacity * 0.2) {
                        bucket2.cacao = bucket2.capacity * 0.2;
                        availableCacao -= bucket2.cacao;
                    } else {
                        // if not enough, still add all the available cacao to bucket2
                        bucket2.cacao = availableCacao;
                        availableCacao = 0;
                    }
                }
            }

            // if bucket has necessary amount of cacao return promise resolved with true 
            if (bucket1.cacao == neededCacao) 
                return true;
            return false; 
        } catch (error) {
            // return rejected promise
            throw new Error(error.message);            
        }
    }

    // load all the buckets and call functions to fill them
    async load(buckets, onBucketReady) {
        try {
            let filledBuckets = 0;
            for (let i = 0; i < buckets.length; i++) {
                // process two buckets and wait for necessary amount of ingredients 
                // to be added to the 1st loaded bucket
                // on the subsequent iteration of loop the second bucket will gain priority
                const cacaoAdded = await this.fillBucketWithCacao(buckets[i], buckets[i + 1]);
                const milkAdded = await this.fillBucketWithMilk(buckets[i], buckets[i + 1]);
                
                if (milkAdded == true && cacaoAdded == true) {
                    // notify that bucket is full
                    onBucketReady(buckets[i]);
                    filledBuckets++;
                }
            }

            // if all the buckets are filled return promise resolved with true
            if (filledBuckets == buckets.length) {
                return true;
            } else {
                // return rejected promise
                throw new Error('Could not fill all the buckets');
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

// load buckets to the machine and call functions
(async () => {
    const buckets = [{
        capacity: 10,
        milk: 0,
        cacao: 0
    }, {
        capacity: 1000,
        milk: 0,
        cacao: 0
    }, {
        capacity: 500,
        milk: 0,
        cacao: 0
    }, {
        capacity: 4000,
        milk: 0,
        cacao: 0
    }, {
        capacity: 200,
        milk: 0,
        cacao: 0
    }, {
        capacity: 1000,
        milk: 0,
        cacao: 0
    }, {
        capacity: 300,
        milk: 0,
        cacao: 0
    }, {
        capacity: 0,
        milk: 0,
        cacao: 0
    }];

    const machine = new Machine();

    const job = setInterval(() => {
        machine.addMilk(Math.random() * 100);
        machine.addCacao(Math.random() * 100);
    }, Math.random() * 100);

    await machine.load(buckets, onBucketReady);

    clearInterval(job);
    
    console.log('Finished filling all the buckets');
}) ()