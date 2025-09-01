<template>
  <div class="h-full bg-bg_color">
    <div class="flex h-full flex-col">
      <el-scrollbar>
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="defaultProps"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          default-expand-all
          @node-click="onTreeSelect"
        >
          <template #default="{ node, data }">
            <span class="flex items-center">
              <IconifyIconOffline
                :icon="
                  data.type === 'dept'
                    ? OfficeBuilding
                    : Location
                "
                class="mr-1"
              />
              {{ node.label }}
            </span>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { getDeptListApi } from "@/api/newsystem/dept";
import { handleTree } from "@/utils/tree";
import { IconifyIconOffline } from "@/components/ReIcon";
import OfficeBuilding from "@iconify-icons/ep/office-building";
import Location from "@iconify-icons/ep/location";

interface Tree {
  id: number;
  label: string;
  children?: Tree[];
}

const props = defineProps({
  searchValue: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["tree-select"]);

const treeRef = ref();
const treeData = ref([]);
const defaultProps = {
  children: "children",
  label: "label"
};

function filterNode(value: string, data: Tree) {
  if (!value) return true;
  return data.label.includes(value);
}

function onTreeSelect(data) {
  emit("tree-select", data);
}

watch(
  () => props.searchValue,
  val => {
    treeRef.value!.filter(val);
  }
);

onMounted(async () => {
  const { data } = await getDeptListApi();
  treeData.value = handleTree(data);
});
</script>

<style scoped>
:deep(.el-tree-node__content) {
  height: 33px;
}
</style>