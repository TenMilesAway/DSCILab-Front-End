<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./rule";
import { ElIcon } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import {
  searchLabUsersByKeywordApi,
  type LabUserProfileDTO
} from "@/api/newsystem/user";

interface EventAuthorFormItem {
  userId?: number | null;
  name: string;
  nameEn?: string;
  affiliation?: string;
  authorOrder: number;
  isCorresponding?: boolean;
  role?: string;
  visible?: boolean;
}

interface FormInlineData {
  id: number;
  title: string;
  eventTime: string;
  content: string;
  published: boolean;
  authors: EventAuthorFormItem[];
}

interface FormProps {
  formInline: FormInlineData;
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    title: "",
    eventTime: "",
    content: "",
    published: false,
    authors: []
  })
});

const formRuleRef = ref();
const newFormInline = ref<FormInlineData>({ ...props.formInline });
const imageInputRef = ref<HTMLInputElement | null>(null);
const contentEditorRef = ref<HTMLDivElement | null>(null);

watch(
  () => props.formInline,
  newVal => {
    newFormInline.value = {
      ...newVal,
      authors: Array.isArray(newVal.authors) ? [...newVal.authors] : []
    };
    nextTick(() => {
      if (contentEditorRef.value) {
        contentEditorRef.value.innerHTML = newFormInline.value.content || "";
      }
    });
  },
  { deep: true, immediate: true }
);

const addAuthor = () => {
  const order = newFormInline.value.authors.length + 1;
  newFormInline.value.authors.push({
    userId: null,
    name: "",
    nameEn: "",
    affiliation: "",
    authorOrder: order,
    isCorresponding: false,
    role: "",
    visible: true
  });
};

const removeAuthor = (index: number) => {
  newFormInline.value.authors.splice(index, 1);
  newFormInline.value.authors.forEach((author, idx) => {
    author.authorOrder = idx + 1;
  });
};

async function fetchUserSuggest(
  query: string,
  cb: (
    results: Array<{ value: string; id: number; englishName?: string | null }>
  ) => void
) {
  const keyword = (query || "").trim();
  if (!keyword) {
    cb([]);
    return;
  }
  try {
    const res = await searchLabUsersByKeywordApi(keyword);
    const users: LabUserProfileDTO[] = res.code === 0 ? res.data || [] : [];
    cb(
      users.map(user => ({
        value: user.realName,
        id: user.id,
        englishName: user.englishName || ""
      }))
    );
  } catch {
    cb([]);
  }
}

function onUserSelect(
  index: number,
  item: { value: string; id: number; englishName?: string | null }
) {
  const author = newFormInline.value.authors[index];
  author.userId = item.id;
  author.name = item.value;
  if (item.englishName) {
    author.nameEn = item.englishName;
  }
}

function onUserClear(index: number) {
  const author = newFormInline.value.authors[index];
  author.userId = null;
}

const toDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read image failed"));
    reader.readAsDataURL(file);
  });
};

const syncModelFromEditor = () => {
  newFormInline.value.content = contentEditorRef.value?.innerHTML || "";
};

const insertImageAtCursor = (imageUrl: string) => {
  const editor = contentEditorRef.value;
  if (!editor) return;

  const html = `<p><img src="${imageUrl}" alt="活动图片" /></p>`;
  const selection = window.getSelection();

  if (
    selection &&
    selection.rangeCount > 0 &&
    editor.contains(selection.focusNode)
  ) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    const fragment = document.createDocumentFragment();
    let node: ChildNode | null = null;
    let lastNode: ChildNode | null = null;
    while ((node = wrapper.firstChild)) {
      lastNode = fragment.appendChild(node);
    }
    range.insertNode(fragment);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } else {
    editor.focus();
    editor.insertAdjacentHTML("beforeend", html);
  }

  syncModelFromEditor();
};

const triggerImageSelect = () => {
  contentEditorRef.value?.focus();
  imageInputRef.value?.click();
};

const onSelectLocalImage = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    input.value = "";
    return;
  }
  try {
    const dataUrl = await toDataUrl(file);
    insertImageAtCursor(dataUrl);
  } finally {
    input.value = "";
  }
};

const handleContentPaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;
  const imageItem = Array.from(items).find(item =>
    item.type.startsWith("image/")
  );
  if (!imageItem) return;

  const file = imageItem.getAsFile();
  if (!file) return;
  event.preventDefault();
  const dataUrl = await toDataUrl(file);
  insertImageAtCursor(dataUrl);
};

const handleContentInput = () => {
  syncModelFromEditor();
};

function getFormRuleRef() {
  return formRuleRef.value;
}

function getFormData() {
  return {
    ...newFormInline.value,
    authors: Array.isArray(newFormInline.value.authors)
      ? newFormInline.value.authors.map(item => ({ ...item }))
      : []
  };
}

defineExpose({ getFormRuleRef, getFormData });
</script>

<template>
  <el-form
    ref="formRuleRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="100px"
  >
    <el-row :gutter="30">
      <re-col :value="24">
        <el-form-item label="活动标题" prop="title">
          <el-input
            v-model="newFormInline.title"
            clearable
            placeholder="请输入活动标题"
            type="textarea"
            :rows="2"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="活动时间" prop="eventTime">
          <el-date-picker
            v-model="newFormInline.eventTime"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            class="w-full"
            placeholder="请选择活动日期"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="发布状态" prop="published">
          <el-switch
            v-model="newFormInline.published"
            active-text="已发布"
            inactive-text="未发布"
            inline-prompt
          >
          </el-switch>
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="作者信息">
          <div class="authors-container">
            <div
              v-for="(author, index) in newFormInline.authors"
              :key="index"
              class="author-item"
            >
              <div class="author-title-row">
                <span class="author-order">第{{ index + 1 }}作者</span>
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="removeAuthor(index)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
              <el-row :gutter="12">
                <el-col :span="24">
                  <el-form-item>
                    <el-autocomplete
                      v-model="author.name"
                      :fetch-suggestions="fetchUserSuggest"
                      placeholder="作者姓名"
                      clearable
                      class="w-full"
                      @select="item => onUserSelect(index, item)"
                      @clear="onUserClear(index)"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" plain @click="addAuthor">
              <el-icon><Plus /></el-icon>
              添加作者
            </el-button>
          </div>
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="活动内容" prop="content">
          <div class="content-editor-wrap">
            <div class="content-tools">
              <el-button
                size="small"
                type="primary"
                plain
                @click="triggerImageSelect"
              >
                插入图片
              </el-button>
              <span class="content-tip">支持 Ctrl/Cmd+V 直接粘贴图片</span>
              <input
                ref="imageInputRef"
                class="hidden-image-input"
                type="file"
                accept="image/*"
                @change="onSelectLocalImage"
              />
            </div>
            <div
              ref="contentEditorRef"
              class="content-editor"
              contenteditable="true"
              @paste="handleContentPaste"
              @input="handleContentInput"
            />
          </div>
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>

<style scoped lang="scss">
.authors-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.author-item {
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background-color: var(--el-fill-color-light);
}

.author-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.author-order {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.content-editor-wrap {
  width: 100%;
}

.content-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.content-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.content-editor {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  min-height: 260px;
  padding: 10px;
  background: var(--el-fill-color-blank);
  line-height: 1.8;
  overflow-y: auto;

  &:empty::before {
    content: "请输入活动内容（可直接粘贴图片）";
    color: var(--el-text-color-placeholder);
  }

  &:focus {
    border-color: var(--el-color-primary);
    outline: none;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    margin: 6px 0;
    border-radius: 4px;
  }
}

.hidden-image-input {
  display: none;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}
</style>
