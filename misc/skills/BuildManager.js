export class BuildManager {
  static saveBuild(buildData) {
    const buildString = JSON.stringify(buildData, null, 2);

    navigator.clipboard.writeText(buildString).then(() => {
      alert('Build data copied to clipboard!');
    }).catch(() => {
      prompt('Copy this build data:', buildString);
    });
  }

  static loadBuild(buildDataString) {
    try {
      const parsed = JSON.parse(buildDataString);
      
      if (parsed.skillLevels && parsed.skillSpending !== undefined) {
        return {
          success: true,
          data: parsed
        };
      } else {
        throw new Error('Invalid build data format - missing required fields');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}