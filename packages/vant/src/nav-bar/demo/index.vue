<script setup lang="ts">
import VanNavBar from '..';
import VanIcon from '../../icon';
import { useTranslate } from '../../../docs/site';
import { Toast } from '../../toast';

const t = useTranslate({
  'zh-CN': {
    useSlot: '使用插槽',
    showBack: '返回上级',
    rightButton: '右侧按钮',
  },
  'en-US': {
    useSlot: 'Use Slot',
    showBack: 'Back',
    rightButton: 'Right Button',
  },
});

const onClickLeft = () => Toast(t('back'));
const onClickRight = () => Toast(t('button'));
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <van-nav-bar :title="t('title')" />
  </demo-block>

  <demo-block :title="t('showBack')">
    <van-nav-bar
      :title="t('title')"
      :left-text="t('back')"
      left-arrow
      @click-right="onClickRight"
    />
  </demo-block>

  <demo-block :title="t('rightButton')">
    <van-nav-bar
      :title="t('title')"
      :left-text="t('back')"
      :right-text="t('button')"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
    />
  </demo-block>

  <demo-block :title="t('useSlot')">
    <van-nav-bar :title="t('title')" :left-text="t('back')" left-arrow>
      <template #right>
        <van-icon name="search" size="18" />
      </template>
    </van-nav-bar>
  </demo-block>
</template>
