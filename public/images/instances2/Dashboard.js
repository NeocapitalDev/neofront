import Link from 'next/link';
import Image from 'next/image';

function Dashboard() {
  return (
    <div className='min-h-screen bg-slate-100 p-4 py-6'>
      <div className='mb-6 flex justify-end space-x-4'>
        <Link
          href='#'
          className='rounded-md bg-red-100 px-4 py-2 text-red-600 hover:bg-red-300'
        >
          Destroy Instance
        </Link>
        <Link
          href='#'
          className='rounded-md bg-cyan-100 px-4 py-2 text-blue-700 hover:bg-blue-300'
        >
          Reboot Instance
        </Link>
        <Link
          href='#'
          className='rounded-md bg-red-100 px-4 py-2 text-red-600 hover:bg-red-300'
        >
          Delete
        </Link>
      </div>
      <div className='space-y-8'>
        <section className='rounded-lg bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)]'>
          <div className='flex flex-col md:flex-row'>
            <div className='flex-1 border-b border-gray-200 p-4 md:border-b-0 md:border-r'>
              <div className='flex-1 flex-col p-4'>
                <div className='mb-8 md:mb-11'>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Instance ID
                  </h3>
                  <p className='text-lg font-semibold text-green-600'>22735</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Type</h3>
                  <p className='text-lg font-semibold text-blue-500'>
                    Trial Instance
                  </p>
                </div>
              </div>
            </div>
            <div className='flex-1 border-b border-gray-200 p-4 md:border-b-0 md:border-r'>
              <div className='flex-1 flex-col p-4 '>
                <div className='flex align-center justify-between'>
                  <div className='mb-8 md:mb-11'>
                    <h3 className='text-sm font-medium text-gray-500'>
                      Current Status
                    </h3>
                    <p className='text-2xl font-medium text-green-600'>Qr</p>
                  </div>
                  <div className='text-sm font-medium pt-5'>
                    <p className='bg-cyan-100 rounded-full px-1'>
                      <span className='text-green-500 text-lg'>&#10003;</span>{' '}
                      Success
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Expires in
                  </h3>
                  <p className='text-lg font-semibold text-blue-500'>
                    66 hour(s)
                  </p>
                </div>
              </div>
            </div>
            <div className='flex-1 border-b border-gray-200 p-4 md:border-b-0'>
              <div className='flex-1 flex-col p-4'>
                <div className='mb-8 md:mb-11'>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Webhook Failures (today)
                  </h3>
                  <p className='text-sm font-medium text-gray-500'>
                    <span className='text-2xl font-medium text-green-600'>
                      0
                    </span>{' '}
                    of 0 in total
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Expires at
                  </h3>
                  <p className='text-lg font-semibold text-blue-500'>
                    2024-10-09 18:01:06 UTC
                  </p>
                </div>
              </div>
            </div>
            <div className='relative flex-1 p-4 before:absolute before:left-0 before:top-0 before:h-1/2 before:w-[1px] before:bg-gray-200'>
              <div className='flex-1 flex-col p-4'>
                <div className='mb-8 md:mb-11'>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Created At
                  </h3>
                  <p className='text-lg font-semibold text-green-600'>
                    2024-10-09 18:01:06 UTC
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className='rounded-lg bg-white p-6 shadow-[0_0_5px_rgba(0,0,0,0.1)]'>
          <h2 className='mb-4 text-xl font-semibold'>Connect your instance</h2>
          <p className='mb-1'>
            Scan the QR code to connect your WhatsApp phone number with this
            instance.
          </p>
          <p className='mb-4'>
            After that you are able to send and receive WhatsApp messages.
          </p>
          <div className='flex flex-col md:flex-row md:space-x-4'>
            <div className='mb-4 md:mb-0 flex-shrink-0'>
              <div className='inline-block border-2 border-gray-200 p-2 rounded-lg overflow-hidden h-52'>
                <Image
                  // src='/images/img-qr.jpg'
                  alt='QR Code'
                  width={200}
                  height={200}
                  className='rounded-md w-full h-full object-cover'
                />
              </div>
            </div>
            <div className='w-1/3'>
              <div className='border-2 border-gray-200 p-2 rounded-lg overflow-hidden h-52'>
                <Image
                  // src='/images/tel-wapp.jpg'
                  alt='Hand holding a phone with WhatsApp'
                  width={200}
                  height={50}
                  className='w-full h-full object-cover rounded-md'
                />
              </div>
            </div>
          </div>
        </section>
        <section className='rounded-lg bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)]'>
          <div className='flex justify-start p-4 mb-4 border-b-2'>
            <h2 className='text-xl font-semibold'>Instance Settings</h2>
          </div>
          {/* <hr className='border-t-2 border-gray-200 mt-2 mb-6' /> */}
          <div className='mt-2 mb-2 p-4'>
            <h3 className='text-sm font-semibold text-gray-500 mb-2'>
              Webhook URL
            </h3>
            <input
              type='text'
              placeholder='https://your-domain.com/instance/22735/webhook'
              className='w-full rounded-md border border-gray-300 p-2'
            />
          </div>
          <div className='p-4'>
            <h3 className='text-sm font-semibold text-gray-500 mb-4'>
              Webhook Events
            </h3>
            <div className='grid grid-cols-3 gap-4'>
              {[
                'message',
                'authenticated',
                'disconnected',
                'message_revoke_me',
                'media_uploaded',
                'group_update',
                'loading_screen',
                'auth_failure',
                'message_create',
                'message_ack',
                'group_join',
                'change_state',
                'qr',
                'ready',
                'message_revoke_everyone',
                'message_reaction',
                'group_leave',
                'call',
              ].map((event) => (
                <div key={event} className='flex items-center'>
                  <input
                    type='checkbox'
                    id={event}
                    className='mr-2 h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-600'
                  />
                  <label
                    htmlFor={event}
                    className='text-sm font-semibold text-gray-600 flex items-center'
                  >
                    {event}{' '}
                    <span className='ml-2 h-3 w-3 border border-gray-600 rounded-full text-gray-600 text-[0.5rem] font-semibold flex items-center justify-center'>
                      &#105;
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className='py-2 px-4'>
            <p className='text-sm text-gray-500 mb-1'>
              As soon as one of these events occur, the webhook URL above will
              be called with the event data.
            </p>
            <p className='text-sm text-blue-500 mb-6'>
              <Link href='#'>Check out Docs</Link> for further information on
              webhooks.
            </p>
          </div>
          <div className='px-4 pb-4'>
            <button className='rounded-md bg-green-500 text-white px-4 py-2 hover:bg-blue-500'>
              Save
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
