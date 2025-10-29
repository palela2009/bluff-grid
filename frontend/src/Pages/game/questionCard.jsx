import soundManager from "../../lib/sounds"

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

  console.log(
    "QuestionCard render - showAnswer:",
    showAnswer,
    "voteCounts:",
    voteCounts
  )

  return (
    <div className="card">
      {answers.map((option, index) => {
        let className = "btn btn-secondary"
        if (showAnswer) {
          className += option === correct ? " correct" : " incorrect"
        }
        const votes = voteCounts?.[index] || 0
        console.log(`Option ${index}: "${option}" - ${votes} vote(s)`)
        return (
          <div key={index}>
            <button
              className={className}
              onClick={() => handleClick(option, index)}
              disabled={showAnswer}
            >
              {option}
            </button>
            {showAnswer && (
              <div className="vote-count">
                {votes} vote{votes !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
