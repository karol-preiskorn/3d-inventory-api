// Cloud Function for cost monitoring and automatic scaling
// File: cloud-functions/cost-monitor/index.js

const { CloudRunServiceV1Client } = require('@google-cloud/run')

const cloudRun = new CloudRunServiceV1Client()

exports.monitorCosts = async (message) => {
  const data = JSON.parse(Buffer.from(message.data, 'base64').toString())
  console.log('Budget alert received:', data)

  const { costAmount, budgetAmount } = data
  const costPercentage = (costAmount / budgetAmount) * 100

  console.log(`Cost alert: ${costPercentage.toFixed(2)}% of budget used`)

  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  const region = process.env.GCP_REGION || 'us-central1'
  const serviceName = process.env.SERVICE_NAME || '3d-inventory-api'

  try {
    if (costPercentage >= 75 && costPercentage < 90) {
      console.log('75% threshold reached - scaling down service')
      await scaleDownService(projectId, region, serviceName)
    } else if (costPercentage >= 90 && costPercentage < 100) {
      console.log('90% threshold reached - aggressive scaling down')
      await aggressiveScaleDown(projectId, region, serviceName)
    } else if (costPercentage >= 100) {
      console.log('100% threshold reached - suspending service')
      await suspendService(projectId, region, serviceName)
    }
  } catch (error) {
    console.error('Error handling cost alert:', error)
  }
}

async function scaleDownService(projectId, region, serviceName) {
  const name = `projects/${projectId}/locations/${region}/services/${serviceName}`

  try {
    const [service] = await cloudRun.getService({ name })

    // Update service configuration
    service.spec.template.metadata.annotations = {
      ...service.spec.template.metadata.annotations,
      'autoscaling.knative.dev/maxScale': '5',
      'autoscaling.knative.dev/minScale': '0'
    }

    service.spec.template.spec.containers[0].resources = {
      limits: {
        cpu: '0.5',
        memory: '512Mi'
      }
    }

    await cloudRun.replaceService({ service })
    console.log('Service scaled down successfully')
  } catch (error) {
    console.error('Error scaling down service:', error)
  }
}

async function aggressiveScaleDown(projectId, region, serviceName) {
  const name = `projects/${projectId}/locations/${region}/services/${serviceName}`

  try {
    const [service] = await cloudRun.getService({ name })

    service.spec.template.metadata.annotations = {
      ...service.spec.template.metadata.annotations,
      'autoscaling.knative.dev/maxScale': '2',
      'autoscaling.knative.dev/minScale': '0'
    }

    service.spec.template.spec.containers[0].resources = {
      limits: {
        cpu: '0.25',
        memory: '256Mi'
      }
    }

    await cloudRun.replaceService({ service })
    console.log('Service aggressively scaled down')
  } catch (error) {
    console.error('Error aggressively scaling down service:', error)
  }
}

async function suspendService(projectId, region, serviceName) {
  const name = `projects/${projectId}/locations/${region}/services/${serviceName}`

  try {
    const [service] = await cloudRun.getService({ name })

    // Set traffic to 0% to effectively suspend the service
    service.spec.traffic = [{
      percent: 0,
      latestRevision: true
    }]

    await cloudRun.replaceService({ service })
    console.log('Service suspended due to cost overrun')

    // Send alert to Slack or email
    await sendEmergencyAlert(serviceName, 'suspended')
  } catch (error) {
    console.error('Error suspending service:', error)
  }
}

async function sendEmergencyAlert(serviceName, action) {
  // Implement your preferred alerting mechanism
  console.log(`EMERGENCY ALERT: Service ${serviceName} has been ${action} due to cost overrun`)

  // Example: Send to Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    const fetch = require('node-fetch')
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 COST ALERT: Service ${serviceName} has been ${action} due to budget overrun!`
      })
    })
  }
}
