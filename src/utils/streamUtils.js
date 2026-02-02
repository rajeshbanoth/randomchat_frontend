export const createPlaceholderStream = () => {
  console.log('🎬 Creating placeholder video stream...');
  
  try {
    // Create a canvas element for placeholder video
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    // Create a placeholder MediaStream
    const placeholderStream = new MediaStream();
    
    // Create animation for the placeholder
    let animationFrameId;
    let angle = 0;
    
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#1f2937'; // gray-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient circle
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, '#3b82f6'); // blue-500
      gradient.addColorStop(1, '#8b5cf6'); // purple-500
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(canvas.width, canvas.height) / 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw camera icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷', 0, 0);
      
      ctx.restore();
      
      angle += 0.02;
      
      // Capture canvas as video frame
      canvas.captureStream(30).getVideoTracks()[0]?.stop();
      
      // Add new video track to stream
      const videoTrack = canvas.captureStream(30).getVideoTracks()[0];
      if (videoTrack) {
        // Clear existing tracks
        placeholderStream.getTracks().forEach(track => track.stop());
        placeholderStream.addTrack(videoTrack);
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Store animation frame ID for cleanup
    placeholderStream._animationFrame = animationFrameId;
    
    // Create a silent audio track
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const destination = audioContext.createMediaStreamDestination();
    oscillator.connect(destination);
    oscillator.frequency.setValueAtTime(0, audioContext.currentTime);
    oscillator.start();
    
    const audioTrack = destination.stream.getAudioTracks()[0];
    placeholderStream.addTrack(audioTrack);
    
    console.log('✅ Placeholder stream created with animation');
    return placeholderStream;
    
  } catch (error) {
    console.error('❌ Error creating placeholder stream:', error);
    
    // Fallback: Create a simple static placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📷', canvas.width / 2, canvas.height / 2);
    
    const stream = canvas.captureStream(1);
    return stream;
  }
};