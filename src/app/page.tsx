export default function Home() {
  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold mb-4">Buyer Lead Intake App</h1>
      <p className="text-gray-600 mb-8">Manage your real estate buyer leads efficiently</p>
      <div className="space-x-4">
        <a 
          href="/buyers" 
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block"
        >
          View All Leads
        </a>
        <a 
          href="/buyers/new" 
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 inline-block"
        >
          Add New Lead
        </a>
      </div>
    </div>
  )
}
