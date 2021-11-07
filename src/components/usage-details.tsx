interface IUsageDetailsProps {
  count: number;
  public: number;
  private: number;
}

const UsageDetail: React.FC<{ title: string; stat: number | string }> = (props) => (
  <div className="bg-white  dark:bg-onyx-800 overflow-hidden shadow rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <dt className="text-sm font-medium text-gray-400 truncate">{props.title}</dt>
      <dd className="mt-1 font-mono text-3xl font-semibold text-gray-900 dark:text-gray-100">
        {props.stat}
      </dd>
    </div>
  </div>
);

export function UsageDetails(props: IUsageDetailsProps) {
  return (
    <div>
      <h4 className="text-lg mb-2 font-bold">Usage</h4>
      <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3  mb-8 ">
        <UsageDetail title="Total Entries" stat={props.count} />
        <UsageDetail title="Public Entries" stat={props.public} />
        <UsageDetail title="Private Entries" stat={props.private} />
      </dl>
    </div>
  );
}
