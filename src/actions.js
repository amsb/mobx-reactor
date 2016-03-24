
export async function scheduleAction(type, delay, payload) {
  await (new Promise(resolve => setTimeout(resolve,
    Math.round(1000*delay) // delay given in seconds
  )))
  return { type, options: {}, payload }
}
