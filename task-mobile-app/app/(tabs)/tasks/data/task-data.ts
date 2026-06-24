export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'Work' | 'Personal' | 'Urgent';
  status: 'Pending' | 'Completed';
  dueDate: string;
  steps?: SubTask[];
}

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Buy Groceries',
    description: 'Milk, Eggs, Bread, and some fruits for the week.',
    category: 'Personal',
    status: 'Pending',
    dueDate: '2024-05-20',
    steps: [
      { id: '1-1', title: 'Milk', completed: true },
      { id: '1-2', title: 'Eggs', completed: false },
      { id: '1-3', title: 'Bread & fruits', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Finish Project',
    description: 'Complete the React Native UI components and sync with the backend.',
    category: 'Work',
    status: 'Pending',
    dueDate: '2024-05-18',
    steps: [
      { id: '2-1', title: 'Setup workspace and assets', completed: true },
      { id: '2-2', title: 'Build modern responsive UI components', completed: false },
      { id: '2-3', title: 'Connect components to local storage and backend state', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Send Invoice',
    description: 'Send the monthly invoice to the client for the consultancy work.',
    category: 'Urgent',
    status: 'Completed',
    dueDate: '2024-05-15',
    steps: [
      { id: '3-1', title: 'Compile billable hours', completed: true },
      { id: '3-2', title: 'Generate PDF invoice', completed: true },
      { id: '3-3', title: 'Send email to client', completed: true },
    ],
  },
];
