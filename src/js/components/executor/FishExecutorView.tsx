import { FC, useEffect, useRef, useState } from 'react';
// @ts-ignore
import FishExecutor from 'fish-interpreter';
import Layout from '../layouts/Layout';
import CodeView from './CodeView';
import ExecutorControls from './ExecutorControls';
import FishEditor from '../fishEditor/FishEditor';
import { Mode } from '../../enum';
import { convertToList } from './ExecutorControls';

interface FishExecutorViewProps {
	source: string
	initialStack?: number[]
}

interface FishExecutorViewState {
	grid: number[][]
	instructionPointer: { x: number, y: number }
	inputBuffer: string[]
	stackSnapshot: number[]
	output: string
	error: Error | null
	intervalTime: number
	hasStarted: boolean
	isPaused: boolean
	hasTerminated: boolean
	advances: number
	register: number
}

const FishExecutorView: FC<FishExecutorViewProps> = ({ source, initialStack }) => {
	const [state, setState] = useState<FishExecutorViewState>({
		grid: [],
		instructionPointer: { x: 0, y: 0 },
		inputBuffer: [],
		stackSnapshot: [],
		output: '',
		error: null,
		intervalTime: 0,
		hasStarted: false,
		isPaused: false,
		hasTerminated: false,
		advances: 0,
		register: 0
	});

	const extractData = (executor: FishExecutor) => {
		// Update the state
		setState({
			grid: executor.grid,
			instructionPointer: executor.instructionPointer,
			inputBuffer: executor.inputBuffer,
			stackSnapshot: executor.stackSnapshot,
			output: executor.output,
			error: executor.error,
			intervalTime: executor.intervalTime,
			hasStarted: executor.hasStarted,
			isPaused: executor.isPaused,
			hasTerminated: executor.hasTerminated,
			advances: executor.advances,
			register: executor._program._stack._register
		});
	};

	const changeIntervalTime = (newInterval: number) => {
		// Tell the executor
		executor.current.intervalTime = newInterval;

		// Update the state
		setState(prev => ({
			...prev,
			intervalTime: newInterval,
		}));
	};

	const [localInitialStack, setLocalInitialStack] = useState<number[]>([]);
	const executor = useRef<FishExecutor>();

	const reset = (newInitialStack: number[], newSource: string = "") => {
		// XXX This whole method is quite hacky, but it works

		// Store the initial stack for next reset
		setLocalInitialStack(newInitialStack);

		// Keep the input from the previous one if it has not yet started
		let input: number[] = [];
		if (executor.current && !executor.current.hasStarted) {
			input = executor.current.inputBuffer;
		}

		let toInput = localStorage.getItem('code');

		// Create the executor
		executor.current = new FishExecutor(toInput, newInitialStack);

		// Give it the input
		const inputStream = localStorage.getItem("input_stream") || "";

		convertToList(inputStream, Mode.Text)
			.map((num) => String.fromCharCode(num))
			.forEach((c) => executor.current.giveInput(c));

		// Initialize the state
		extractData(executor.current);

		// Subscribe to updates in the executor
		executor.current.onUpdate(extractData);
	};

	useEffect(() => {
		reset(initialStack || []);
	}, []);

	if (!executor.current) {
		return null;
	}

	return (
		<Layout>
			<div className="fish-code-executor-view col">
				<FishEditor
					execute={() => reset([], localStorage.code)}
				/>
				<CodeView
					grid={state.grid}
					instructionPointer={state.instructionPointer}
				/>
				<ExecutorControls
					intervalTime={state.intervalTime}
					changeIntervalTime={changeIntervalTime}
					hasStarted={state.hasStarted}
					isPaused={state.isPaused}
					hasTerminated={state.hasTerminated}
					run={executor.current.run}
					runStep={() => {executor.current.run(); executor.current.pause();}}
					pause={executor.current.pause}
					resume={executor.current.resume}
					step={executor.current.step}
					giveInput={executor.current.giveInput}
					reset={reset.bind(this, localInitialStack)}
					setInitialStack={reset}
					inputBuffer={state.inputBuffer}
					stackSnapshot={state.stackSnapshot}
					output={state.output}
					advances={state.advances}
					register={state.register}
					error={state.error}
				/>
			</div>
		</Layout>
	);
};

export default FishExecutorView;
