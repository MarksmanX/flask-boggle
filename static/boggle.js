class BoggleGame {
    /* make a new game at this DOM id */
    constructor(boardID, secs = 60) {
        this.secs = secs; //game length
        this.showTimer();

        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardID);

        // every 1000 msec, "tick"
        this.timer = setInterval(this.tick.bind(this), 1000);

        $("#submit-form").on("submit", this.handleSubmit.bind(this));
    }

    /* show word in list of words */

    showWord(word) {
        console.log("ran showWord")
        $(".words").append($("<li>", {text: word}));
    }

    /* show score in html */

    showScore() {
        $(".score").text(this.score);
    }

    /* show a status message */

    showMessage(msg, cls) {
        $(".msg")
        .text(msg)
        .removeClass()
        .addClass(`msg ${cls}`);
    }

    /* handle submission of word: if unique and valid, score & show */

    async handleSubmit(evt) {
        evt.preventDefault();
        console.log("ran handleSubmit function")
        const $word = $("#wordguess");

        let word = $word.val();
        if (!word) {
            return;
        }
        
        if (this.words.has(word)) {
            this.showMessage(`Already found ${word}`, "err");
            return;
        }

        //check server for validity
        const resp = await axios.get("/guess-word", { params: { word: word }});
        if (resp.data.result === "not-word") {
            this.showMessage(`${word} is not a valid English word`, "err");
        } else if (resp.data.result === "not-on-board") {
            this.showMessage(`${word} is not on the board`, "err");
        } else {
            this.showWord(word);
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`Added: ${word}`, "ok");
        }

        $word.val("").focus();
    }

    /* Update timer in DOM */

    showTimer() {
        $(".timer").text(this.secs);
    }

    /* Tick: handle a second passing in game */

    async tick() {
        this.secs -= 1;
        this.showTimer();

        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    /* end of game: score and update message. */

    async scoreGame() {
        console.log("ran scoreGame")
        $(".add-word").hide();
        const resp = await axios.post("/post-score", { score: this.score });
        if (resp.data.brokeRecord) {
            this.showMessage(`New record: ${this.score}`, "ok");
        } else {
            this.showMessage(`Final score: ${this.score}`, "ok");
        }
    }
}