import { FC, useState } from 'react';
import FishEditor from './fishEditor/FishEditor';
import FishExecutorView from './executor/FishExecutorView';

const STORAGE_KEY = 'code';

const Controller: FC = () => {
	const defaultValue = localStorage.getItem(STORAGE_KEY) ?? '';
	localStorage.setItem(STORAGE_KEY, defaultValue || '');

	return (
		<FishExecutorView
			source={localStorage.code}
		/>
	);
};

export default Controller;
