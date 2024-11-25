// Simulates the network performance analysis
function runTest() {
  const serverIP = document.getElementById("serverIP").value;
  const outputElement = document.getElementById("output");

  if (!serverIP) {
    alert("Please enter a valid server IP address!");
    return;
  }

  // Clear previous results
  outputElement.textContent = "Running analysis...\n";

  // Parameters for simulation
  const totalPackets = 100;
  const packetLossProbability = 0.1; // 10% chance of packet loss
  const bufferSize = 1024; // bytes
  const rttResults = [];
  let packetsSent = 0;
  let packetsLost = 0;

  const startTime = performance.now();

  // Simulating packet transmission
  for (let i = 0; i < totalPackets; i++) {
    const sendTime = performance.now();

    // Simulate packet loss
    if (Math.random() < packetLossProbability) {
      packetsLost++;
      outputElement.textContent += `Packet ${i + 1}: Lost\n`;
      continue;
    }

    // Simulate RTT (in milliseconds)
    const rtt = Math.random() * (50 - 10) + 10; // Random RTT between 10ms and 50ms
    const receiveTime = sendTime + rtt;
    rttResults.push(rtt);

    outputElement.textContent += `Packet ${i + 1}: RTT = ${rtt.toFixed(
      2
    )} ms\n`;
    packetsSent++;
  }

  // Calculate overall statistics
  const endTime = performance.now();
  const elapsedTime = (endTime - startTime) / 1000; // in seconds
  const avgRTT = rttResults.reduce((a, b) => a + b, 0) / packetsSent;
  const jitter =
    packetsSent > 1
      ? rttResults
          .slice(1)
          .reduce((sum, val, i) => sum + Math.abs(val - rttResults[i]), 0) /
        (packetsSent - 1)
      : 0;
  const throughput = (packetsSent * bufferSize) / elapsedTime; // bytes/sec
  const packetLossPercentage = (packetsLost / totalPackets) * 100;

  // Calculate MOS
  const mos = calculateMOS(avgRTT, jitter, packetLossPercentage);

  // Display final results
  outputElement.textContent += "\n--- Final Results ---\n";
  outputElement.textContent += `Total Packets Sent: ${packetsSent}\n`;
  outputElement.textContent += `Total Packets Lost: ${packetsLost}\n`;
  outputElement.textContent += `Packet Loss Percentage: ${packetLossPercentage.toFixed(
    2
  )}%\n`;
  outputElement.textContent += `Average RTT: ${avgRTT.toFixed(2)} ms\n`;
  outputElement.textContent += `Jitter: ${jitter.toFixed(2)} ms\n`;
  outputElement.textContent += `Throughput: ${(throughput / 1024).toFixed(
    2
  )} KB/s\n`;
  outputElement.textContent += `MOS: ${mos.toFixed(2)} / 5.0\n`;
}

// Function to calculate MOS based on RTT, jitter, and packet loss
function calculateMOS(rtt, jitter, packetLoss) {
  // Adjust values to prevent extreme MOS values
  const effectiveRTT = Math.min(Math.max(rtt, 0), 500); // Cap RTT at 500 ms
  const effectiveJitter = Math.min(Math.max(jitter, 0), 100); // Cap jitter at 100 ms
  const effectiveLoss = Math.min(Math.max(packetLoss, 0), 100); // Cap packet loss at 100%

  // Simplified MOS formula (based on ITU-T G.107 E-model)
  const rFactor =
    93.2 - effectiveRTT / 40 - effectiveJitter / 10 - 2.5 * effectiveLoss;
  const mos = 1 + (rFactor - 6) * (4 / 94); // Map R-factor to MOS (1 to 5 scale)

  return Math.max(1.0, Math.min(mos, 5.0)); // Clamp MOS to range [1, 5]
}
