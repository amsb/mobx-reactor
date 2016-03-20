
export async function scheduleAction(actionType, delay, payload) {
  await (new Promise(resolve => setTimeout(resolve,
    Math.round(1000*delay) // delay given in seconds
  )))
  return { actionType, options: {}, payload }
}
