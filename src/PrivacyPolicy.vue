<template>
  <div class="flex flex-row justify-center w-full">
    <article class="card bg-base-100 shadow-xl mx-8 prose max-w-none w-full lg:w-3/4 p-4">
      <h1>Privacy Policy</h1>
      <p>Phira is an community-based rhythm game, serving players from all over the globe. In order to provide the service, we must often collect, store and transmit personal information. We pay continuous effort to make the process as transparent as possible.</p>
      <p>By using our service, you confirm that you have read and understood the <router-link to="/terms-of-use">Terms of Use</router-link> and this Privacy Policy, including how and why we use your information and that your use of the service is subject to the applicable <router-link to="/terms-of-use">Terms of Use</router-link> and this Privacy Policy.</p>
      <h2>Information we collect</h2>
      <h3>Registration</h3>
      <p>On registering an account, we have to collect and store:</p>
      <ol>
        <li>Your email address</li>
        <li>Your username</li>
        <li>You password (PBKDF2, SHA512)</li>
        <li>You locale preference</li>
      </ol>
      <p>Only your username and locale is made public. We won't sell your email address to third parties.</p>
      <h3>Logging in</h3>
      <p>On login, we collect and store your:</p>
      <ol>
        <li>IP address</li>
      </ol>
      <p>Your IP address will never be publicly visible.</p>
      <h2>Disclosures of your personal data</h2>
      <p>We don't disclose your personal data without your consent, with the following exceptions:</p>
      <ol>
        <li>You have expressly made information public.</li>
        <li>According to relevant legal provisions or upon requests from administrative or judicial authorities, we have to disclose to third parties or administrative/judicial bodies.</li>
        <li>In cases of any violations of relevant People's Republic of China's laws, regulations, Phira's <router-link to="/terms-of-use">Terms of Use</router-link>, or related rules, and it's necessary to disclose your data to third parties.</li>
        <li>When such action is necessary to enforce Phira terms of use.</li>
      </ol>
      <h2>Cookies</h2>
      <p>We use cookies to maintain your sessions state. We won't track your online activities using cookies.</p>
      <h2>Data security</h2>
      <p>We strive to keep your information safe. For instance, we encrypt your login credentials before storing them; we employ HTTPs to ensure your data are transmitted safely. However, it's impossible to guarantee that our system is unbreakable. Under that scenario, we'll do our best to prevent leakage of your data.</p>
      <h2>Updates</h2>
      <p>We reserve the rights to update this Privacy Policy. On updating, we'll make announcements on our websites and applications.</p>
    </article>
  </div>
</template>

<style scoped>
article * {
  @apply my-2;
}

article a {
  font-style: italic;
}
</style>
