import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { FiSave, FiBell, FiMail, FiSmartphone, FiDownload, FiRefreshCw } from "react-icons/fi";

const UpdatesSettings = () => {
    const { colors } = useTheme();
    const [notificationSettings, setNotificationSettings] = useState({
        emailUpdates: true,
        smsUpdates: false,
        pushNotifications: true,
        systemAlerts: true,
        maintenanceNotifications: true,
        featureUpdates: true
    });
    
    const [updatePreferences, setUpdatePreferences] = useState({
        autoUpdate: false,
        updateChannel: "stable",
        backupBeforeUpdate: true
    });

    const handleNotificationChange = (setting) => {
        setNotificationSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const handleUpdatePreferenceChange = (setting, value) => {
        setUpdatePreferences(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Updates Settings Data:", {
            notifications: notificationSettings,
            updatePreferences: updatePreferences
        });
        // API call will be implemented later
    };

    const checkForUpdates = () => {
        console.log("Checking for updates...");
        // This would trigger an update check
    };

    return (
        <div className="space-y-6">
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
                <h3 className={`text-xl font-semibold ${colors.textPrimary} mb-6`}>
                    Updates & Notifications Settings
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Notification Preferences */}
                    <div>
                        <h4 className={`text-lg font-medium ${colors.textPrimary} mb-4`}>
                            <FiBell size={18} className="inline mr-2" />
                            Notification Preferences
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'emailUpdates', label: 'Email Updates', icon: FiMail },
                                { key: 'smsUpdates', label: 'SMS Notifications', icon: FiSmartphone },
                                { key: 'pushNotifications', label: 'Push Notifications', icon: FiBell },
                                { key: 'systemAlerts', label: 'System Alerts', icon: FiBell },
                                { key: 'maintenanceNotifications', label: 'Maintenance Notices', icon: FiBell },
                                { key: 'featureUpdates', label: 'Feature Updates', icon: FiBell }
                            ].map(({ key, label, icon: Icon }) => (
                                <div key={key} className={`p-4 ${colors.secondary} rounded-xl border ${colors.borderMuted}`}>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center space-x-3">
                                            <Icon size={16} className={colors.textMuted} />
                                            <span className={`text-sm font-medium ${colors.textPrimary}`}>
                                                {label}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings[key]}
                                                onChange={() => handleNotificationChange(key)}
                                                className="sr-only"
                                            />
                                            <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                                                notificationSettings[key] 
                                                    ? 'bg-purple-600' 
                                                    : 'bg-gray-300 dark:bg-gray-600'
                                            }`}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 transform mt-1 ${
                                                    notificationSettings[key] ? 'translate-x-5' : 'translate-x-1'
                                                }`} />
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Update Preferences */}
                    <div>
                        <h4 className={`text-lg font-medium ${colors.textPrimary} mb-4`}>
                            <FiDownload size={18} className="inline mr-2" />
                            Update Preferences
                        </h4>
                        <div className="space-y-4">
                            {/* Auto Update Toggle */}
                            <div className={`p-4 ${colors.secondary} rounded-xl border ${colors.borderMuted}`}>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span className={`text-sm font-medium ${colors.textPrimary}`}>
                                            Automatic Updates
                                        </span>
                                        <p className={`text-xs ${colors.textMuted} mt-1`}>
                                            Install updates automatically when available
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={updatePreferences.autoUpdate}
                                            onChange={() => handleUpdatePreferenceChange('autoUpdate', !updatePreferences.autoUpdate)}
                                            className="sr-only"
                                        />
                                        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                                            updatePreferences.autoUpdate 
                                                ? 'bg-purple-600' 
                                                : 'bg-gray-300 dark:bg-gray-600'
                                        }`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 transform mt-1 ${
                                                updatePreferences.autoUpdate ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Update Channel */}
                            <div className={`p-4 ${colors.secondary} rounded-xl border ${colors.borderMuted}`}>
                                <label className={`block text-sm font-medium ${colors.textPrimary} mb-3`}>
                                    Update Channel
                                </label>
                                <select
                                    value={updatePreferences.updateChannel}
                                    onChange={(e) => handleUpdatePreferenceChange('updateChannel', e.target.value)}
                                    className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
                                >
                                    <option value="stable">Stable (Recommended)</option>
                                    <option value="beta">Beta (Early Access)</option>
                                    <option value="alpha">Alpha (Experimental)</option>
                                </select>
                            </div>

                            {/* Backup Before Update */}
                            <div className={`p-4 ${colors.secondary} rounded-xl border ${colors.borderMuted}`}>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span className={`text-sm font-medium ${colors.textPrimary}`}>
                                            Backup Before Updates
                                        </span>
                                        <p className={`text-xs ${colors.textMuted} mt-1`}>
                                            Create a backup before installing updates
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={updatePreferences.backupBeforeUpdate}
                                            onChange={() => handleUpdatePreferenceChange('backupBeforeUpdate', !updatePreferences.backupBeforeUpdate)}
                                            className="sr-only"
                                        />
                                        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                                            updatePreferences.backupBeforeUpdate 
                                                ? 'bg-purple-600' 
                                                : 'bg-gray-300 dark:bg-gray-600'
                                        }`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 transform mt-1 ${
                                                updatePreferences.backupBeforeUpdate ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className={`p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-200 dark:border-green-800`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className={`font-medium ${colors.textPrimary} mb-1`}>
                                    System Status
                                </h4>
                                <p className={`text-sm ${colors.textSecondary}`}>
                                    Your system is up to date
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={checkForUpdates}
                                className={`flex items-center space-x-2 px-4 py-2 ${colors.buttonSecondary} rounded-lg transition-colors duration-200 hover:opacity-80`}
                            >
                                <FiRefreshCw size={16} />
                                <span>Check Updates</span>
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className={`flex items-center space-x-2 px-6 py-3 ${colors.button} rounded-xl transition-all duration-200 ${colors.shadow} hover:shadow-lg`}
                        >
                            <FiSave size={18} />
                            <span>Save Settings</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdatesSettings;