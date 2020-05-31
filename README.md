# Mediasoup video conferencing

Example website for multi-party video/audio/screen conferencing using mediasoup. This project is intended to better understand how mediasoup works with a simple example. 

# Running the code

- run `npm install` then `npm start` to run the application. Then open your browser at `https://localhost:3016` or your own defined port/url in the config file.
- (optional) edit the `src/config.js` file according to your needs and replace the `ssl/key.pem ssl/cert.pem` certificates with your own.



notes : Best to run the project on a linux system as the mediasoup installation could have issues by installing on windows. If you have a windows system consider installing WSL to be able to run it. 

[installing wsl on windows 10](https://docs.microsoft.com/en-us/windows/wsl/install-win10)