import createAnswer from "~~/app/lib/actions";
import { Question } from "~~/app/lib/definitions";

export default function VotingForm({ question }: { question: Question }) {
  return (
    <form action={createAnswer}>
      <div className="items-left m-8">
        <div>{question.question}</div>
        {question.choices_array.map(choice => (
          <div className="flex items-center mb-4" key={choice}>
            <label className="label cursor-pointer ms-2">
              <input type="radio" name="radio-0" value={choice} className="radio checked:bg-red-500" />
              <span className="ms-2">{choice}</span>
            </label>
          </div>
        ))}
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-4 rounded">Submit</button>
      </div>
    </form>
  );
}
