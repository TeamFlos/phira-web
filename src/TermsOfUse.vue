<script setup lang="ts">
import { i18n } from './main';
</script>

<template>
  <div class="flex flex-row justify-center w-full">
    <article class="card bg-base-100 shadow-xl mx-8 prose max-w-none w-full lg:w-3/4 p-4">
      <template v-if="i18n.global.locale.value === 'en'">
        <h1>Terms of Use</h1>
        <p>
          <b>TeamFlos</b> is offering you a service, which is conditioned on your acceptance, without any modification whatsoever to the following terms, conditions, and notices.
        </p>
        <p>
          By visiting and/or using the services offered by this site (<a class="link link-hover !not-italic" href="https://phira.moe">https://phira.moe</a>), the Phira game client
          or any affiliated services (henceforth referenced as "<b>Phira</b>"), you are acknowledging your full compliance to the terms and conditions listed here, and that you
          warrant that you will not use this web site, or any of the content obtained from this web site, for any purpose that is unlawful or prohibited by these terms.
        </p>
        <p>
          In addition to this policy, please also make sure to visit and understand our
          <router-link to="/privacy-policy">Privacy Policy</router-link>
        </p>

        <h2>DESCRIPTION OF SERVICE</h2>
        <p>
          Phira provides online gameplay services free of charge to end users, along with online rankings. Phira also provides users with a means of hosting user-generated content
          allowing other users to gain access to uploaded content.
        </p>
        <p>
          The Phira management make no guarantees as to whether any user-uploaded content and information is accurate, current, or of substantial quality.<br />
          We assume no responsibility as to whether objectionable content has been uploaded.<br />
          We assume no responsibility over whether users have the rights to distribute uploaded content.
        </p>

        <h2>MODIFICATIONS TO TERMS OF USE</h2>
        <p>Phira may change the terms and conditions of the Terms of Use from time to time.</p>
        <p>
          Your failure to abide by the modified terms may result in termination of your Phira service. You agree that your continued use of the service constitutes your agreement
          to the modified terms of the Terms of Use.
        </p>

        <h2>MODIFICATIONS TO SERVICE</h2>
        <p>Phira reserves the right to modify or discontinue the service with or without notice to user.</p>
        <p>Phira shall not be liable to user or any third party should Phira exercise its right to modify or discontinue the service.</p>

        <h2>DISCLAIMER</h2>
        <p>
          The materials are provided on an 'as is' basis. Phira makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without
          limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of
          rights.
        </p>

        <p>
          Further, Phira does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials or otherwise relating to
          such materials.
        </p>

        <p>Finally, Phira is not obligated, expressed or implied, to provide any maintenance, technical or other support for its services.</p>

        <h2>INDEMNITY</h2>
        <p>
          You agree to defend, indemnify and hold harmless Phira, its parent organization, officers, directors, employees and agents, from and against any and all claims, damages,
          obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from: (i) your use of and access to Phira; (ii) your
          violation of any term of these Terms of Use; (iii) your violation of any third party right, including without limitation any copyright, property, or privacy right; or
          (iv) any claim that one of your user submissions caused damage to a third party.<br />
          This defence and indemnification obligation will survive these Terms of Use and your use of Phira.
        </p>

        <h2>YOUR USE OF PHIRA'S CONTENT</h2>
        <p>
          You understand that when using the Phira, you will be exposed to user submissions from a variety of sources, and that Phira is not responsible for the accuracy,
          usefulness, safety, or intellectual property rights of or relating to such user submissions.<br />
          You further understand and acknowledge that you may be exposed to user submissions that are inaccurate, offensive, indecent, or objectionable, and you agree to waive, and
          hereby do waive, any legal or equitable rights or remedies you have or may have against Phira with respect thereto, and agree to indemnify and hold Phira, its
          Owners/Operators, affiliates, and/or licensors, harmless to the fullest extent allowed by law regarding all matters related to your use of the site.
        </p>

        <h2>USER SUBMISSIONS AND CONTENT REMOVAL</h2>
        <p>
          You shall be solely responsible for your own user submissions and the consequences of posting or publishing them. In connection with user submissions, you affirm,
          represent, and/or warrant that: you own or have the necessary licences, rights, consents, and permissions to use and authorise Phira to use all patent, trademark, trade
          secret, copyright or other proprietary rights in and to any and all user submissions to enable inclusion and use of the user submissions in the manner contemplated by the
          Website and these Terms of Use.<br />
          In connection with user submissions, you further agree that you will not submit material that is copyrighted, protected by trade secret or otherwise subject to third
          party proprietary rights, including privacy and publicity rights, unless you are the owner of such rights or have permission from their rightful owner to post the
          material and to grant Phira all of the licence rights granted herein.
        </p>
        <b>
          Phira does not endorse any user submission or any opinion, recommendation, or advice expressed therein, and Phira expressly disclaims any and all liability in connection
          with user submissions.<br />
          Phira does not permit copyright infringing activities and infringement of intellectual property rights on its Website, and Phira will remove all content and user
          submissions if properly notified that such content or user submission infringes on another's intellectual property rights.<br />
          Phira reserves the right to remove content and user submission without prior notice.
        </b>

        <h2>PRIVACY POLICIES</h2>
        <p>See <router-link to="/privacy-policy">Privacy Policy</router-link>.</p>

        <h2>PROPRIETARY RIGHTS TO CONTENT</h2>
        <p>
          User acknowledges that content, including but not limited to text, software, music, sound, photographs, video, graphics, name references or other material contained in
          either sponsor advertisements search results, provided to or accessed by user via the service ("content") by Phira, is protected by copyrights, trademarks, service marks,
          patents or other proprietary rights and laws; therefore, user is only permitted to use this content as expressly authorised by the service.<br />
          User may not copy, reproduce, distribute, or create derivative works from this content without expressly having explicit authorization from the service.
        </p>

        <h2>LINKS</h2>
        <p>
          Phira may provide, or users may include in e-mail, links to other websites or resources.<br />
          User acknowledges and agrees that Phira is not responsible for the availability of such external sites or resources, and does not endorse and is not responsible or liable
          for any content, advertising, products, or other materials on or available from such sites or resources.<br />
          User agrees that Phira shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of
          or reliance on any such content, goods or services available on such external sites or resources.
        </p>

        <h2>GOVERNING LAW</h2>
        <p>These terms are governed by and construed in accordance with the laws of the People's Republic of China, and shall be interpreted accordingly.</p>

        <h2>ATTRIBUTION</h2>
        <p>Portions of this text are based on the "osu! Terms of Service" and "Cytoid Terms of Service", licensed under CC-BY-NC 4.0.</p>
      </template>

      <template v-if="i18n.global.locale.value === 'zh-CN'">
        <h1>使用条款</h1>
        <p>使用 TeamFlos 提供的服务之前，您必须接受以下内容。</p>
        <p>
          访问与使用此网站（<a class="link link-hover !not-italic" href="https://phira.moe">https://phira.moe</a>）、Phira
          游戏客户端以及任何关联服务（以下统称“<b>Phira</b>”）即代表您确认您完全遵守此处列出的条款和条件，且保证您不会将 TeamFlos
          提供服务的任何内容（包括本网站与本网站提供的内容）用于任何违法或被条款禁止的目的。
        </p>
        <p>在该份条款之外，您还需要确保接受我们的 <router-link to="/privacy-policy">隐私政策</router-link>。</p>

        <h2>服务描述</h2>
        <p>Phira 向用户提供在线游玩服务。Phira 同时提供了托管用户上传内容的方式，使得其他用户可以访问上传的内容。</p>
        <p>对于用户上传内容，Phira 不对无论是否已上传的，令人反感的内容承担责任；不保证用户拥有分发已上传内容的权利，并不对由此造成的后果承担责任。</p>

        <h2>使用条款的修改</h2>
        <p>Phira 保留自由修改使用条款的权利。</p>
        <p>使用条款以最新版为准。未遵守可能导致您被禁用 Phira 的服务。</p>

        <h2>服务的修改</h2>
        <p>Phira 保留修改或终止服务而不向用户通知的权利。</p>
        <p>Phira 在行使修改或终止服务权利时，不对任何用户或第三方承担责任。</p>

        <h2>免责声明</h2>
        <p>
          本文材料均以“现状”提供。Phira
          不提供任何明示或暗示的保证，且在此声明并否认所有其他保证，包括但不限于对适销性、特定用途适用性或知识产权的非侵权性或其他权利的侵犯的暗示保证或条件。
        </p>
        <p>此外，Phira 不保证或作出任何关于材料使用的准确性、可能结果或可靠性的陈述，或与此类材料相关的其他陈述。</p>
        <p>最后，Phira 没有义务（明示或暗示）为其服务提供任何维护、技术支持或其他支持。</p>

        <h2>赔偿责任</h2>
        <p>若由于：</p>
        <p>(i) 您对 Phira 的使用和访问；</p>
        <p>(ii) 您违反这些使用条款的任何条件；</p>
        <p>(iii) 您侵犯任何第三方权利，包括但不限于任何版权、财产或隐私权；</p>
        <p>(iv) 您上传的内容对第三方造成了损害；</p>
        <p>(v) 其它您应承担责任的情形。</p>
        <p>
          导致了 Phira 可能面临损失。您同意主动解决争端并作出必要赔偿，使
          Phira、母组织、高管、董事、员工和代理人免受任何索赔、损害、损失或债务以及开支（包括但不限于律师费）等负面影响。
        </p>
        <p>此责任将在这些使用条款和您使用 Phira 之后继续存在。</p>

        <h2>您对 Phira 内容的使用</h2>
        <p>
          您应理解以下内容：在使用 Phira 的过程中，您将会接触来自各种来源的用户上传内容，且 Phira
          对这些用户上传内容的准确性、实用性、安全性或知识产权不负责。此外，你理解并承认，您可能会接触到不准确、冒犯、淫秽或令人反感的用户上传内容，并且您同意放弃在此方面可能拥有的法律或公平权利或救济措施，同意在法律允许的最大范围内，就与您使用该网站相关的所有事项，对
          Phira、其所有者/运营者、附属公司和/或许可方免责。
        </p>

        <h2>用户上传内容和内容删除</h2>
        <p>
          您对您自己的用户上传内容及其发布或发表的后果负完全责任。关于用户上传内容，您确认、声明或保证：您拥有或具备必要的许可、权利、同意和权限，以便使用并授权 Phira
          使用一切专利、商标、商业秘密、版权或其他专有权利，以便按照网站和这些使用条款的规定的方式包含和使用所有用户提交内容。关于用户提交内容，您同意不会提交受版权保护、受商业秘密保护或受第三方专有权利（包括隐私和公众形象权）约束的材料，除非您是这些权利的所有者，或者已获得其合法所有者的许可来发布此材料，并授权
          Phira 拥有在此授予的所有许可权利。
        </p>
        <p>
          内容上传在 Phira 在线社区不代表 Phira 对其认可，也不代表 Phira 认可其中表达的任何观点、建议或意见。Phira 明确否认与用户提交内容相关的任何和所有责任。Phira
          不允许在其网站上进行侵犯版权的活动和侵犯知识产权的行为，如果得到适当的通知表明此类内容或用户提交内容侵犯了他人的知识产权，Phira 有权力删除或进一步维权。
        </p>
        <p>Phira 保留在没有事先通知的情况下删除内容和用户提交内容的权利。</p>

        <h2>隐私政策</h2>
        <p>参见 <router-link to="/privacy-policy">隐私政策</router-link>。</p>

        <h2>内容的专有权利</h2>
        <p>
          您应承认，Phira
          所提供的内容，包括但不限于文本、软件、音乐、声音、照片、视频、图形、名称引用或其他通过服务向用户提供或用户访问的材料（“内容”），受版权、商标、服务标志、专利或其他专有权利和法律的保护；因此，用户只有在获得明确授权的情况下才能使用此内容。
        </p>
        <p>用户不得未经法律授权，对内容进行任何可能侵害版权方利益的行为，包括从这些内容中创建衍生作品。Phira 保留追责的权利。</p>

        <h2>链接</h2>
        <p>Phira 可能提供其他网站或资源的链接。您可能在电子邮件等处中接收到这些链接。</p>
        <p>您应接受 Phira 不对这些外部网站或资源的负责，并且不代表 Phira 认可其中的内容。Phira 不对这些网站或资源上或可用的任何内容、广告、产品或其他材料负责或承担任何责任。</p>
        <p>您应同意 Phira 不会直接或间接地对因使用或依赖这些外部网站或资源上的任何内容、商品或服务而引起或声称引起的任何损害或损失负责或承担任何责任。</p>

        <h2>适用法律</h2>
        <p>本内容所涉及条款受中华人民共和国法律管辖并根据其进行解释。</p>

        <h2>归属</h2>
        <p>本文部分内容基于“osu! 服务条款”和“Terms of Service - Cytoid”，并已通过 CC-BY-NC 4.0 获得许可。</p>
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
