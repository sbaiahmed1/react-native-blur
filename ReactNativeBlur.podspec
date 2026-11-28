require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactNativeBlur"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/sbaiahmed1/react-native-blur.git", :tag => "v#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,cpp,swift}"
  s.swift_version = '5.0'
  s.module_name = "ReactNativeBlur"
  s.private_header_files = "ios/**/*.h"

  # Podfile.properties.json wins over the environment, so an Expo prebuild keeps the setting.
  no_private_api = begin
    properties = File.join(Pod::Config.instance.installation_root.to_s, "Podfile.properties.json")
    JSON.parse(File.read(properties))["ReactNativeBlur_noPrivateApi"]
  rescue StandardError
    nil
  end
  no_private_api = ENV["REACT_NATIVE_BLUR_NO_PRIVATE_API"] if no_private_api.nil?
  if ["1", "true"].include?(no_private_api.to_s)
    s.pod_target_xcconfig = { "SWIFT_ACTIVE_COMPILATION_CONDITIONS" => "$(inherited) REACT_NATIVE_BLUR_NO_PRIVATE_API" }
    Pod::UI.puts "[ReactNativeBlur] Private iOS API compiled out"
  end

  install_modules_dependencies(s)
end
