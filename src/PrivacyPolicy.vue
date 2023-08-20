<script setup lang="ts">
import { i18n } from './main';
</script>

<template>
  <div class="flex flex-row justify-center w-full">
    <article class="card bg-base-100 shadow-xl mx-8 prose max-w-none w-full lg:w-3/4 p-4">
      <template v-if="i18n.global.locale.value === 'en'">
        <h1>Privacy Policy</h1>
        <p>
          Phira is an community-based rhythm game, serving players from all over the globe. In order to provide the service, we must often collect, store and transmit personal
          information. We pay continuous effort to make the process as transparent as possible.
        </p>
        <p>
          By using our service, you confirm that you have read and understood the <router-link to="/terms-of-use">Terms of Use</router-link> and this Privacy Policy, including how
          and why we use your information and that your use of the service is subject to the applicable <router-link to="/terms-of-use">Terms of Use</router-link> and this Privacy
          Policy.
        </p>

        <h2>Information we collect</h2>
        <h3>Registration</h3>
        <p>On registering an account, we have to collect and store:</p>
        <ol>
          <li>Your email address</li>
          <li>Your username</li>
          <li>You password (encrypted securely with PBKDF2, SHA512)</li>
          <li>You locale preference</li>
        </ol>
        <p>Only your username and locale is implicitly made public. We won't sell your email address to third parties.</p>
        <h3>Logging in</h3>
        <p>On login, we collect and store your:</p>
        <ol>
          <li>IP address</li>
        </ol>
        <p>Your IP address will never be publicly visible.</p>

        <h2>Disclosures of your personal data</h2>
        <p>We don't disclose your personal data without your consent, with the following exceptions:</p>
        <ol>
          <li>Your username, locale, play records, registration time and login time.</li>
          <li>You have expressly made information public.</li>
          <li>
            According to relevant legal provisions or upon requests from administrative or judicial authorities, we have to disclose to third parties or administrative/judicial
            bodies.
          </li>
          <li>
            In cases of any violations of relevant People's Republic of China's laws, regulations, Phira's
            <router-link to="/terms-of-use">Terms of Use</router-link>, or related rules, and it's necessary to disclose your data to third parties.
          </li>
          <li>
            When such action is necessary to enforce Phira's
            <router-link to="/terms-of-use">Terms of Use</router-link>.
          </li>
        </ol>

        <h2>Cookies</h2>
        <p>We use cookies to maintain your sessions state. We won't track your online activities using cookies.</p>

        <h2>Data security</h2>
        <p>
          We strive to keep your information safe. However, it's impossible to guarantee that our system is unbreakable. Under that scenario, we'll do our best to prevent leakage
          of your data.
        </p>

        <h2>Updates</h2>
        <p>We reserve the rights to update this Privacy Policy. On updating, we'll make announcements on our websites and applications.</p>
      </template>

      <template v-if="i18n.global.locale.value === 'zh-CN'">
        <h1>隐私政策</h1>
        <p>Phira 是一款基于社区的音乐游戏，为全球的玩家提供服务。为了提供服务，我们不得不经常收集、存储和传输个人信息。我们持续努力使这个过程尽可能透明化。</p>
        <p>
          在使用我们的服务前，您必须确认您已阅读并理解
          <router-link to="/terms-of-use">使用条款</router-link>
          和隐私政策，包括我们如何以及为何使用您的信息，且您使用服务的行为均受到
          <router-link to="/terms-of-use">使用条款</router-link>
          和隐私政策约束。
        </p>

        <h2>我们收集的信息</h2>
        <h3>注册</h3>
        <p>在您注册账号时，我们将会收集并储存您的：</p>
        <ol>
          <li>邮箱地址</li>
          <li>用户名</li>
          <li>密码（使用 PBKDF2, SHA512 加密储存）</li>
          <li>语言偏好</li>
        </ol>
        <p>只有您的用户名和语言偏好会被公开。我们不会将您的邮箱地址售卖给第三方。</p>
        <h3>登录</h3>
        <p>在您登录时，我们会收集并储存您的：</p>
        <ol>
          <li>IP 地址</li>
        </ol>
        <p>您的 IP 永远不会向任何人可见。</p>

        <h2>关于您隐私的披露</h2>
        <p>我们不会在未经您允许的情况下披露您的隐私，但以下内容除外：</p>
        <ol>
          <li>您的用户名、语言偏好、游玩记录、注册和登录时间。</li>
          <li>您明确表达愿意披露的信息。</li>
          <li>根据法律的有关规定或行政或司法机构的要求，需要向第三方或者行政、司法机构披露</li>
          <li>
            您出现违反中国有关法律、法规或者 Phira
            <router-link to="/terms-of-use">使用条款</router-link>
            或相关规则的情况，需要向第三方披露
          </li>
          <li>
            其他为执行
            <router-link to="/terms-of-use">使用条款</router-link>
            而需要披露的信息。
          </li>
        </ol>

        <h2>Cookies</h2>
        <p>我们使用 cookies 来维护您的会话状态。我们不会使用 cookies 来追踪您的在线活动。</p>

        <h2>数据安全</h2>
        <p>我们致力于保证您的信息安全，然而任何系统均不可能保证不可被攻击。即使出现不可抗因素导致 Phira 被攻击，我们也会尽全力防止您的信息泄露。</p>

        <h2>政策更新</h2>
        <p>我们保留更新此隐私政策的权利。若有更新，我们将会在网站和应用上通知。</p>
      </template>
    </article>
  </div>
</template>

<style scoped>
article * {
  @apply my-2;
}

article br {
  @apply my-0;
}

article a {
  font-style: italic;
}
</style>
