import { useState } from 'react';

export default function Configurations() {
  const settings = [
    {
      id: 'reject_calls',
      label: 'Reject Calls',
      description: 'Reject all incoming calls',
    },
    {
      id: 'ignore_groups',
      label: 'Ignore Groups',
      description: 'Ignore all messages from groups',
    },
    {
      id: 'always_online',
      label: 'Always Online',
      description: 'Keep the WhatsApp always online',
    },
    {
      id: 'read_messages',
      label: 'Read Messages',
      description: 'Mark all messages as read',
    },
    {
      id: 'sync_full_history',
      label: 'Sync Full History',
      description: 'Sync all complete chat history on scan QR code',
    },
    {
      id: 'read_status',
      label: 'Read Status',
      description: 'Mark all statuses as read',
    },
  ];

  const Switch = ({ id }) => {
    const [active, setActive] = useState(false);

    return (
      <button
        id={id}
        type='button'
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          active ? 'bg-green-500' : 'bg-slate-400'
        }`}
        onClick={() => setActive(!active)}
      >
        <span
          className={`absolute h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
            active ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    );
  };

  const Button = ({ label }) => {
    return (
      <button className='mt-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400'>
        {label}
      </button>
    );
  };

  return (
    <div className='p-6 bg-white text-black min-h-screen'>
      <h1 className='text-2xl font-semibold mb-6'>Settings</h1>
      <ul className='space-y-4'>
        {settings.map((setting) => (
          <li
            key={setting.id}
            className='flex justify-between items-center border-b border-gray-200 py-2'
          >
            <div>
              <p className='font-medium text-lg'>{setting.label}</p>
              <p className='text-sm text-gray-500'>{setting.description}</p>
            </div>
            <Switch id={setting.id} />
          </li>
        ))}
      </ul>
      <div className='flex justify-end'>
        <Button label='Save' />
      </div>
    </div>
  );
}
