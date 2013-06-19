/**
 * A queue that outsources jobs to child processes and
 * then reports results back via "message" event
 */

var cp = require("child_process")
  , emitter = require("events").EventEmitter

/**
 * @param {number} capacity Amount of child processes
 * @param {string} workerPath path to worker source code
 */
function Queue(capacity, workerPath) {
    this._freeWorkers = [];
    this._queue = [];
    for(var i = 0; i < capacity; ++i) {
        var w = cp.fork(workerPath);
        w.on("message", function(worker, m) {
            this.emit("complete", m);
            this._freeWorkers.push(worker);
            this._triggerTasks();
        }.bind(this, w));
        this._freeWorkers.push(w);
    }
}

Queue.prototype = {
    addTask: function(task) {
        this._queue.push(task);
        this._triggerTasks();
    },

    _triggerTasks: function() {
        if (!this._queue.length)
            return;
        if (!this._freeWorkers.length)
            return;
        var worker = this._freeWorkers.pop();
        var job = this._queue.pop();
        worker.send(job);
    },

    __proto__: emitter.prototype
}

/**
 * Worker interface
 */
function QueueWorker() {
    process.on("message", function(m) {
        process.send(this.doWork(m));
    }.bind(this));
}

QueueWorker.prototype = {
    doWork: function(work) { }
}

module.exports = {
    Queue: Queue,
    QueueWorker: QueueWorker
};

