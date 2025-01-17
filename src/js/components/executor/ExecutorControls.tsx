import { FC, useRef } from 'react';
import StateView from './StateView';
import { Mode } from '../../enum';

/**
 * Converts a string to a list which can be given to the program
 *
 * @param {string} text	The text to convert
 * @param {Mode} type	How to interpret the input.
 *
 * @returns {number[]}	A list of individual characters which can be given as input or initial stack
 */
export const convertToList = (text: string, type: Mode): number[] => {
	// Find out how to treat it
	if (type === Mode.Text) {
		// Split into individual characters and take their unicode value
		return text
			.split('')
			.map((c) => c.charCodeAt(0));
	}

	// This is a comma separated list of numbers
	return text
		// Split it into individual numbers
		.split(',')
		// Remove leading and trailing whitespace
		.map((num) => num.trim())
		// Convert them all to numbers
		.map((num) => Number(num));
};

interface ExecutorControlsProps {
	setInitialStack: (stack: number[]) => void
	changeIntervalTime: (newIntervalTime: number) => void
	giveInput: (input: string) => void
	intervalTime: number
	hasStarted: boolean
	isPaused: boolean
	hasTerminated: boolean
	run: () => void
	runStep: () => void
	pause: () => void
	resume: () => void
	step: () => void
	reset: () => void
	inputBuffer: string[]
	stackSnapshot: number[]
	output: string
	error: Error | null
	advances: number
	register: number
}

const ExecutorControls: FC<ExecutorControlsProps> = (
	{
		setInitialStack,
		changeIntervalTime,
		giveInput,
		intervalTime,
		hasStarted,
		isPaused,
		hasTerminated,
		run,
		runStep,
		pause,
		resume,
		step,
		reset,
		inputBuffer,
		stackSnapshot,
		output,
		error,
		advances,
		register
	},
) => {
	const initialStackRef = useRef<HTMLInputElement>(null);
	const executionSpeedRef = useRef<HTMLInputElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	/**
	 * Handles changes to the execution speed input
	 */
	const onExecutionSpeedChange = () => {
		// Calculate the new interval time and set ti
		const newTime = 10 ** -3 * Number(executionSpeedRef.current?.value) ** 2;
		changeIntervalTime(newTime);
	};

	/**
	 * Gives the contents of the inputInput to the program
	 *
	 * @param {Mode} type	How to interpret the input.
	 */
	const updateInput = (type: Mode) => {
		if (!inputRef.current) {
			return;
		}

		// Get the text
		const text = inputRef.current.value || '';

		localStorage.setItem('input_stream',text);


		// Clear the textarea
		inputRef.current.value = '';
	};

	/**
	 * Sets the program's initial stack
	 */
	const changeInitialStack = (type: Mode) => {
		// Get the text
		const text = initialStackRef.current?.value || '';

		// Make a list of it and set it as initial stack
		const list = convertToList(text, type);
		setInitialStack(list);

		// Clear the textarea
		initialStackRef.current!.value = '';
	};

	// Reverse the intervalTime calculation
	const processedIntervalTime = Math.sqrt(10 ** 3 * intervalTime);

	return (
		<div className="fish-program-executor-controls">
			{/* The control buttons */}
			<div>
				<div className="btn-group">
					{!hasTerminated
						?
						!hasStarted
							? <>
								<button type="button" className="btn btn-success" onClick={run}>Start</button>
								<button type="button" className="btn btn-primary" onClick={runStep}>Start (paused)</button>
							  </>
							:
							!isPaused
								? <button type="button" className="btn btn-primary" onClick={pause}>Pause</button>
								: (
									<>
										<button key="resume" type="button" className="btn btn-success" onClick={resume}>Resume</button>
										<button key="step" type="button" className="btn btn-primary" onClick={step}>Step</button>
										<button key="reset" type="button" className="btn btn-danger" onClick={reset}>Reset</button>
									</>
								)
						: <button type="button" className="btn btn-danger" onClick={reset}>Reset</button>
					}
				</div>
			</div>
			{/* The error */}
			{!!error && (
				<div className="error bg-danger col-12">
					<p className="text-white text-center">{error.message}</p>
				</div>
			)}
			{/* Initial stack input */}
			{!hasStarted && (
				<div>
					<label>Set initial stack</label>
					<div>
						<input
							type="text"
							ref={initialStackRef}
							className="form-control"
						/>
						<div className="btn-group">
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => changeInitialStack(Mode.Text)}
							>
								Interpret as text
							</button>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => changeInitialStack(Mode.Number)}
							>
								Interpret as array
							</button>
						</div>
					</div>
				</div>
			)}
			{/* The program state */}
			<StateView
				output={output}
				inputBuffer={inputBuffer}
				stackSnapshot={stackSnapshot}
				advances={advances}
				register={register}
			/>
			{/* Input stream input */}
			<div>
				<label>Write to input stream</label>
				<div>
						<textarea
							ref={inputRef}
							className="form-control"
						>
						</textarea>
					<div className="btn-group">
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => updateInput(Mode.Text)}
						>
							Interpret as text
						</button>
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => updateInput(Mode.Number)}
						>
							Interpret as array
						</button>
					</div>
				</div>
			</div>
			{/* Execution speed */}
			<div className="execution-speed">
				<label>Execution speed</label>
				<div>
					<input
						ref={executionSpeedRef}
						className="form-control"
						type="range"
						min="0"
						max="1000"
						step="0.25"
						value={processedIntervalTime}
						onChange={onExecutionSpeedChange}
					/>
				</div>
			</div>
		</div>
	);
};

export default ExecutorControls;
