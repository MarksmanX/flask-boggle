from boggle import Boggle
from flask import Flask, render_template, session, jsonify, request
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = 'see-krit'
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

""" debug=DebugToolbarExtension(app) """

boggle_game = Boggle()

@app.route('/')
def start_page():
    """Displays Home Page where user can start a new game."""

    return render_template('start.html')


@app.route('/show-game')
def show_game():
    """Creates game board and displays it."""

    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    return render_template('show-game.html', 
                           board=board,
                           highscore=highscore,
                           nplays=nplays)


@app.route('/guess-word', methods=["GET"])
def checks_guessed_word():
    """Checks the word guessed to see if it is a valid word"""

    word = request.args.get("word")
    board = session["board"]
    result = boggle_game.check_valid_word(board, word)

    return jsonify({'result': result})

@app.route('/post-score', methods=["POST"])
def post_score():
    """Receive score, update nplays, update, high score if appropriate"""
    
    score = request.json["score"]
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    session['nplays'] = nplays + 1
    session['highscore'] = max(score, highscore)

    return jsonify(brokeRecord=score > highscore)
