<template>
    <div class="view-reports">
        <h1 class="text-2xl font-bold mb-4">View Reports</h1>
        <button @click="generateReport" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4">Generate
            Report</button>
        <table class="w-full bg-white shadow rounded-lg">
            <thead>
                <tr class="bg-gray-100 border-b">
                    <th class="py-2 px-4">Report Type</th>
                    <th class="py-2 px-4">Date</th>
                    <th class="py-2 px-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="report in reports" :key="report._id" class="border-b">
                    <td class="py-2 px-4">{{ report.type }}</td>
                    <td class="py-2 px-4">{{ report.date }}</td>
                    <td class="py-2 px-4">
                        <button @click="viewReport(report)"
                            class="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600">View</button>
                        <button @click="deleteReport(report._id)"
                            class="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: 'AdminReports',
    data() {
        return {
            reports: []
        };
    },
    methods: {
        fetchReports() {
            // Fetch reports from the backend
        },
        generateReport() {
            // Generate report logic
        },
        viewReport(report) {
            // View report logic
            console.log(report)
        },
        deleteReport(reportId) {
            // Delete report logic
            console.log(reportId)
        }
    },
    mounted() {
        this.fetchReports();
    }
}
</script>