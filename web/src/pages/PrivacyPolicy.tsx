import './PrivacyPolicy.css'

export default function PrivacyPolicy() {
  return (
    <div className="privacy-policy">
      <div className="content-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: October 4, 2025</p>

        <div className="content">
          <p>
            This application ("app") is developed and maintained by an independent developer ("I", "me"). 
            This page informs you of my policies regarding the collection, use, and disclosure of Personal 
            Information I receive from users of the app.
          </p>

          <p>
            I use your Personal Information only for providing and improving the app. By using the app, 
            you agree to the collection and use of information in accordance with this policy.
          </p>

          <section>
            <h2>Information Collection And Use</h2>
            <p>
              To provide you with a personalized experience and enable cloud syncing of your data, 
              the app collects and stores the following information:
            </p>
            <ul>
              <li><strong>Email Address:</strong> Used for account creation and authentication</li>
              <li><strong>Password:</strong> Securely hashed and stored for account security</li>
              <li><strong>Name:</strong> Optional, used to personalize your experience</li>
              <li><strong>Preferences:</strong> Your app settings, notification times, and theme preferences</li>
              <li><strong>Adkar Streaks:</strong> Your progress tracking data for morning and evening adkar</li>
            </ul>
            <p>
              All data is stored securely and is only accessible by you. We do not sell, trade, or 
              otherwise share your personal information with third parties.
            </p>
          </section>

          <section>
            <h2>Authentication and Data Storage</h2>
            <p>
              The app uses <strong>Supabase</strong> (an open-source Firebase alternative) for authentication 
              and database services. Supabase is a trusted third-party service provider that helps us securely 
              store your data in the cloud.
            </p>
            <p>
              Your data is stored in Supabase's secure cloud infrastructure with industry-standard encryption. 
              Passwords are hashed using secure algorithms and are never stored in plain text.
            </p>
            <p>
              For more information about Supabase's security practices, please visit{' '}
              <a href="https://supabase.com/security" target="_blank" rel="noopener noreferrer">
                Supabase Security
              </a>.
            </p>
          </section>

          <section>
            <h2>Log Data</h2>
            <p>
              This app does not collect any log data such as your Internet Protocol ("IP") address, 
              browser type, browser version, the pages of our Site that you visit, the time and date 
              of your visit, the time spent on those pages and other statistics.
            </p>
          </section>

          <section>
            <h2>Adkars and Religious Content</h2>
            <p>
              The app provides authentic Islamic supplications (Adkars) from Hisnul Muslim for morning and 
              evening remembrance. The Adkar content itself is stored locally on your device and is not 
              tracked or monitored.
            </p>
          </section>

          <section>
            <h2>Streak Tracking</h2>
            <p>
              The app includes an optional "Streaks" feature that allows you to mark your daily Adkars as 
              completed. This data is stored in your personal account and is used solely to:
            </p>
            <ul>
              <li>Track your progress over time</li>
              <li>Display your streak count</li>
              <li>Provide motivation to maintain consistency</li>
            </ul>
            <p>
              Your streak data is private and is never shared with anyone. We do not analyze, sell, or 
              use this data for any purpose other than displaying it to you.
            </p>
          </section>

          <section>
            <h2>Notifications</h2>
            <p>
              If you enable notifications, the app will send you local reminders at your chosen times 
              for morning and evening Adkar. Notification preferences are stored in your account settings 
              and can be modified or disabled at any time.
            </p>
          </section>

          <section>
            <h2>Data Deletion</h2>
            <p>
              You have the right to request deletion of your personal data at any time. To delete your 
              account and all associated data, please visit our{' '}
              <a href="/delete-account">account deletion page</a>.
            </p>
          </section>

          <section>
            <h2>Data Security</h2>
            <p>
              We take the security of your data seriously and implement industry-standard security measures:
            </p>
            <ul>
              <li>All data transmissions are encrypted using HTTPS/SSL</li>
              <li>Passwords are hashed using secure algorithms</li>
              <li>Database access is protected by Row Level Security (RLS) policies</li>
              <li>Regular security updates and monitoring</li>
            </ul>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure. 
              While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data (upon request)</li>
              <li>Opt out of notifications</li>
            </ul>
          </section>

          <section>
            <h2>Children's Privacy</h2>
            <p>
              This app does not knowingly collect personal information from children under 13. If you 
              are a parent or guardian and believe your child has provided us with personal information, 
              please contact us to have it removed.
            </p>
          </section>

          <section>
            <h2>Changes To This Privacy Policy</h2>
            <p>
              This Privacy Policy is effective as of October 4, 2025 and will remain in effect except with 
              respect to any changes in its provisions in the future, which will be in effect immediately 
              after being posted on this page.
            </p>
            <p>
              I reserve the right to update or change my Privacy Policy at any time and you should check 
              this Privacy Policy periodically. Your continued use of the app after I post any modifications 
              to the Privacy Policy on this page will constitute your acknowledgment of the modifications 
              and your consent to abide and be bound by the modified Privacy Policy.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our{' '}
              <a href="https://github.com/zameel7/adkar-streak" target="_blank" rel="noopener noreferrer">
                GitHub repository
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

