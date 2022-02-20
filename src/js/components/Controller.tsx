import { FC, useState } from 'react';
import FishEditor from './fishEditor/FishEditor';
import FishExecutorView from './executor/FishExecutorView';

enum Activity {
	Editing,
	Executing
}

const STORAGE_KEY = 'code';

const Controller: FC = () => {
	const [activity, setActivity] = useState<Activity>(Activity.Executing);

	const changeActivity = (newActivity: Activity) => setActivity(newActivity);

	const defaultValue = localStorage.getItem(STORAGE_KEY) ?? '';
	localStorage.setItem(STORAGE_KEY, defaultValue || '');

	return (
		<FishExecutorView
			source={localStorage.code}
			edit={() => changeActivity(Activity.Editing)}
		/>
	);
};

export default Controller;
