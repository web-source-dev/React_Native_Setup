---
description: Troubleshoot Android build failure for React Native (Debug)
---

## Steps to diagnose and fix the build error

1. **Clean the Android build artifacts**
   ```
   cd android
   ./gradlew clean
   ```

2. **Run the Gradle assembleDebug task with full stacktrace**
   // turbo
   ```
   ./gradlew app:assembleDebug -x lint -x test --stacktrace
   ```

3. **Verify Android SDK and NDK locations**
   - Open `android/local.properties` and ensure `sdk.dir` points to a valid Android SDK installation.
   - If using NDK, ensure `ndk.dir` is set correctly or that the SDK Manager has the required NDK version installed.

4. **Check Java version compatibility**
   - React Native typically requires JDK 11. Run `java -version` and confirm.
   - If a different version is installed, adjust `JAVA_HOME` accordingly.

5. **Inspect Gradle dependencies**
   - Open `android/app/build.gradle` and look for any version mismatches, especially for `com.android.tools.build:gradle` and `androidx` libraries.
   - Update them to the latest stable versions compatible with your React Native version.

6. **Run Metro bundler separately**
   ```
   npx expo start
   ```
   Then, in another terminal, run the Gradle command from step 2 again.

7. **If the error persists, capture the full log**
   - Append `--info` to the Gradle command to get more details.
   - Share the relevant portion of the log for further assistance.

---
**Notes**
- The `// turbo` annotation on step 2 allows the workflow engine to auto‑run the Gradle command with stacktrace.
- Ensure you have sufficient RAM and that no other processes are locking files in the `android` folder.
