<template>
  <div class="col-md-9 left-col pull-right">
    <div class="panel article-body content-body">
      <h1 class="text-center">{{ title }}</h1>
      <div class="article-meta text-center">
        <i class="fa fa-clock-o"></i>
        <abbr>{{ date | moment("from") }}</abbr>
      </div>
      <div class="entry-content">
        <div class="content-body entry-content panel-body">
          <div class="markdown-body" v-html="content"></div>

          <div v-if="auth && uid === 1" class="panel-footer operate">
            <div class="actions">
              <a @click="deleteArticle" class="admin" href="javascript:;"
                ><i class="fa fa-trash-o"></i
              ></a>
              <a @click="editArticle" class="admin" href="javascript:;"
                ><i class="fa fa-pencil-square-o"></i
              ></a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 点赞 -->
    <div class="votes-container panel panel-default padding-md">
      <div class="panel-body vote-box text-center">
        <div class="btn-group">
          <a
            @click="like"
            href="javascript:;"
            class="vote btn btn-primary popover-with-html"
            :class="likeClass"
          >
            <i class="fa fa-thumbs-up"></i> {{ likeClass ? "已赞" : "点赞" }}
          </a>
          <div class="or"></div>
          <button @click="showQrcode = true" class="btn btn-success">
            <i class="fa fa-heart"></i> 打赏
          </button>
        </div>
        <div class="voted-users">
          <div class="user-lists">
            <span v-for="likeUser in likeUsers">
              <!-- 点赞用户是当前用户时，加上类 animated 和 swing 以显示一个特别的动画  -->
              <img
                :src="user && user.avatar"
                class="img-thumbnail avatar avatar-middle"
                :class="{ 'animated swing': likeUser.uid === 1 }"
              />
            </span>
          </div>
          <div v-if="!likeUsers.length" class="vote-hint">
            成为第一个点赞的人吧 ?
          </div>
        </div>
      </div>
    </div>

    <!-- 打赏弹窗 -->
<Modal :show.sync="showQrcode" class="text-center">
  <template v-slot:header>
    <div v-if="user">
      <img :src="user.avatar" class="img-thumbnail avatar" width="48">
    </div>
  </template>
  <div>
    <p class="text-md">如果你想学习更多前端的知识，Learnku Vue.js.com 是个不错的开始</p>
    <div class="payment-qrcode inline-block">
      <h5>扫一扫打开 Learnku Vue.js.com</h5>
      <p>
<qrcode-vue value="https://learnku.com/vuejs/" :size="160"></qrcode-vue>        </p>
    </div>
  </div>
  <template v-slot:footer>
    <div>
      <div class="text-center">祝你学习愉快 :)</div>
    </div>
  </template>
</Modal>

  </div>
</template>

<script>
import SimpleMDE from "simplemde";
import hljs from "highlight.js";
import emoji from "node-emoji";
import { mapState } from "vuex";
import QrcodeVue from 'qrcode.vue'

export default {
  name: "Content",
    components: {
    QrcodeVue
  },
data() {
  return {
    title: '', // 文章标题
    content: '', // 文章内容
    date: '', // 文章创建时间
    uid: 1, // 用户 ID
    likeUsers: [], // 点赞用户列表
    likeClass: '', // 点赞样式
    showQrcode: false, // 是否显示打赏弹窗
    commentHtml: '', // 评论 HTML
  }
},
  computed: {
    ...mapState(["auth", "user"]),
  },
  created() {
    const articleId = this.$route.params.articleId;
    const article = this.$store.getters.getArticleById(articleId);

    if (article) {
      // 获取当前文章的 likeUsers
      let { uid, title, content, date, likeUsers } = article;

      this.uid = uid;
      this.title = title;
      this.content = SimpleMDE.prototype.markdown(
        emoji.emojify(content, (name) => name)
      );
      this.date = date;
      // 更新实例的 likeUsers
      this.likeUsers = likeUsers || [];
      // 更新 likeClass，点赞用户列表包含当前用户时，赋值为 active，表示已赞
      this.likeClass = this.likeUsers.some((likeUser) => likeUser.uid === 1)
        ? "active"
        : "";

      this.$nextTick(() => {
        this.$el.querySelectorAll("pre code").forEach((el) => {
          hljs.highlightBlock(el);
        });
      });
    }

    this.articleId = articleId;
  },
mounted() {
  // 已登录时，才开始创建
  if (this.auth) {
    // 自动高亮编辑器的内容
    window.hljs = hljs

    const simplemde = new SimpleMDE({
      element: document.querySelector('#editor'),
      placeholder: '请使用 Markdown 格式书写 ;-)，代码片段黏贴时请注意使用高亮语法。',
      spellChecker: false,
      autoDownloadFontAwesome: false,
      // 不显示工具栏
      toolbar: false,
      // 不显示状态栏
      status: false,
      renderingConfig: {
        codeSyntaxHighlighting: true
      }
    })

    // // 内容改变监听
    // simplemde.codemirror.on('change', () => {
    //   // 更新 commentMarkdown 为编辑器的内容
    //   this.commentMarkdown = simplemde.value()
    //   // 更新 commentHtml，我们先替换原内容中的 emoji 标识，然后使用 markdown 方法将内容转成 HTML
    //   this.commentHtml = simplemde.markdown(emoji.emojify(this.commentMarkdown, name => name))
    // })

    // // 按键松开监听
    // simplemde.codemirror.on('keyup', (codemirror, event) => {
    //   // 使用 Ctrl+Enter 时提交评论
    //   if (event.ctrlKey && event.keyCode === 13) {
    //     this.comment()
    //   }
    // })

    // 将编辑器添加到当前实例
    this.simplemde = simplemde
  }
},

  methods: {
    editArticle() {
      this.$router.push({
        name: "Edit",
        params: { articleId: this.articleId },
      });
    },
    deleteArticle() {
      this.$swal({
        text: "你确定要删除此内容吗?",
        confirmButtonText: "删除",
      }).then((res) => {
        if (res.value) {
          this.$store.dispatch("post", { articleId: this.articleId });
        }
      });
    },
    like(e) {
      // 未登录时，提示登录
      if (!this.auth) {
        this.$swal({
          text: "需要登录以后才能执行此操作。",
          confirmButtonText: "前往登录",
        }).then((res) => {
          if (res.value) {
            this.$router.push("/auth/login");
          }
        });
      } else {
        const target = e.currentTarget;
        // 点赞按钮是否含有 active 类，我们用它来判断是否已赞
        const active = target.classList.contains("active");
        const articleId = this.articleId;

        if (active) {
          // 清除已赞样式
          this.likeClass = "";
          // 分发 like 事件取消赞，更新实例的 likeUsers 为返回的值
          this.$store.dispatch("like", { articleId }).then((likeUsers) => {
            this.likeUsers = likeUsers;
          });
        } else {
          // 添加已赞样式
          this.likeClass = "active animated rubberBand";
          // 分发 like 事件，传入 isAdd 参数点赞，更新实例的 likeUsers 为返回的值
          this.$store
            .dispatch("like", { articleId, isAdd: true })
            .then((likeUsers) => {
              this.likeUsers = likeUsers;
            });
        }
      }
    },
  },
};
</script>
<style scoped>
</style>