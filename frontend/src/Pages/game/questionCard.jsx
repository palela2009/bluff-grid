import soundManager from "../../lib/sounds"
import { CheckCircle, XCircle, Users } from "lucide-react"

export function QuestionCard({
  answers,
  correct,
  onAnswer,
  showAnswer,
  selectedOption,
  voteCounts
}) {
  const handleClick = (option, index) => {
    if (showAnswer) return
    soundManager.play("click")
    onAnswer(option, index)
  }

  const totalVotes = (voteCounts || []).reduce((sum, v) => sum + (v || 0), 0)

  return (
    <div className="question-card">
      <div className="answers-grid">
        {answers.map((option, index) => {
          const isCorrect = option === correct
          const isSelected = selectedOption === index
          const votes = voteCounts?.[index] || 0
          const votePercent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0

          let stateClass = ""
          if (showAnswer) {
            if (isCorrect) stateClass = "answer-correct"
            else if (isSelected && !isCorrect) stateClass = "answer-wrong"
            else stateClass = "answer-revealed"
          } else if (isSelected) {
            stateClass = "answer-selected"
          }

          return (
            <button
              key={index}
              className={`answer-card ${stateClass}`}
              onClick={() => handleClick(option, index)}
              disabled={showAnswer}
            >
              {/* Answer number */}
              <div className="answer-number">{index + 1}</div>

              {/* Answer text */}
              <div className="answer-content">
                <p className="answer-text">{option}</p>
              </div>

              {/* Result indicator */}
              {showAnswer && (
                <div className="answer-result">
                  {isCorrect ? (
                    <div className="result-badge correct-badge">
                      <CheckCircle size={20} />
                      <span>TRUE</span>
                    </div>
                  ) : isSelected && !isCorrect ? (
                    <div className="result-badge wrong-badge">
                      <XCircle size={20} />
                      <span>FALSE</span>
                    </div>
                  ) : (
                    <div className="result-badge neutral-badge">
                      <XCircle size={16} />
                    </div>
                  )}
                </div>
              )}

              {/* Vote bar */}
              {showAnswer && totalVotes > 0 && (
                <div className="vote-bar-wrapper">
                  <div className="vote-bar">
                    <div
                      className={`vote-fill ${isCorrect ? "fill-correct" : "fill-default"}`}
                      style={{ width: `${votePercent}%` }}
                    />
                  </div>
                  <div className="vote-info">
                    <Users size={14} />
                    <span>{votes} vote{votes !== 1 ? "s" : ""}</span>
                    <span className="vote-percent">{votePercent}%</span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {showAnswer && (
        <div className="results-summary">
          {selectedOption !== null && selectedOption === answers.indexOf(correct) ? (
            <div className="result-message correct-message">
              <CheckCircle size={28} />
              <div>
                <strong>Correct!</strong>
                <p>You found the true statement!</p>
              </div>
            </div>
          ) : selectedOption !== null ? (
            <div className="result-message wrong-message">
              <XCircle size={28} />
              <div>
                <strong>Wrong!</strong>
                <p>You were bluffed!</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
