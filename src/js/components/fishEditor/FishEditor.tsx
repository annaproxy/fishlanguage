import { FC, useRef, useState } from 'react';
import Layout from '../layouts/Layout';

const STORAGE_KEY = 'code';

interface FishEditorProps {
	show_header: boolean,
	execute: () => void
}

const FishEditor: FC<FishEditorProps> = ({ show_header: show_thing, execute }) => {
	const editor = useRef<HTMLTextAreaElement>(null);

	const defaultValue = localStorage.getItem(STORAGE_KEY) ?? '';
	const [count, setCount] = useState(editor.current?.value.length ?? '');

	const submit = () => {
		localStorage.setItem(STORAGE_KEY, editor.current?.value ?? '');
		execute();
	};
	if (show_thing) {
		return (
			<Layout>
				<div className="fish-code-editor col">
					<textarea
						className="form-control"
						ref={editor}
						defaultValue={defaultValue}
						placeholder={'Write your ><> code here'}
						rows={10}
						onChange={e => setCount(e.target.value.length)}
					/>
					<p>{count}</p>
					<div className="btn-group">
						<button type="button" className="btn btn-primary" onClick={submit}>Submit</button>
					</div>
				</div>
			</Layout>
		);
	}
	else {
		return <div className="fish-code-editor">
			<textarea
				className="form-control"
				ref={editor}
				defaultValue={defaultValue}
				placeholder={'Write your ><> code here'}
				rows={4}
				onChange={e => setCount(e.target.value.length)}
			/>
			<p>{count}</p>
			<div className="btn-group">
				<button type="button" className="btn btn-primary" onClick={submit} style={{ marginBottom: '10px' }}>Submit</button>
			</div>
		</div>
	}
};

export default FishEditor;
