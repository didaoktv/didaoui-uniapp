import type { App } from 'vue'

// === Input (13) ===
import DdButton from './components/dd-button/dd-button.vue'
import DdInput from './components/dd-input/dd-input.vue'
import DdSwitch from './components/dd-switch/dd-switch.vue'
import DdCheckbox from './components/dd-checkbox/dd-checkbox.vue'
import DdRadio from './components/dd-radio/dd-radio.vue'
import DdSearchBar from './components/dd-search-bar/dd-search-bar.vue'
import DdSlider from './components/dd-slider/dd-slider.vue'
import DdStepper from './components/dd-stepper/dd-stepper.vue'
import DdDatePicker from './components/dd-date-picker/dd-date-picker.vue'
import DdField from './components/dd-field/dd-field.vue'
import DdPicker from './components/dd-picker/dd-picker.vue'
import DdRate from './components/dd-rate/dd-rate.vue'
import DdUpload from './components/dd-upload/dd-upload.vue'
import DdIcon from './components/dd-icon/dd-icon.vue'

// === Navigation (12) ===
import DdNavigation from './components/dd-navigation/dd-navigation.vue'
import DdTopNavbar from './components/dd-top-navbar/dd-top-navbar.vue'
import DdSegmentedTab from './components/dd-segmented-tab/dd-segmented-tab.vue'
import DdSwipeableTab from './components/dd-swipeable-tab/dd-swipeable-tab.vue'
import DdDrawer from './components/dd-drawer/dd-drawer.vue'
import DdTabbar from './components/dd-tabbar/dd-tabbar.vue'
import DdTabbarItem from './components/dd-tabbar-item/dd-tabbar-item.vue'
import DdBacktop from './components/dd-backtop/dd-backtop.vue'
import DdCollapse from './components/dd-collapse/dd-collapse.vue'
import DdCollapseItem from './components/dd-collapse-item/dd-collapse-item.vue'
import DdDropdownMenu from './components/dd-dropdown-menu/dd-dropdown-menu.vue'
import DdDropdownItem from './components/dd-dropdown-item/dd-dropdown-item.vue'

// === Layout (4) ===
import DdCard from './components/dd-card/dd-card.vue'
import DdRoomCard from './components/dd-room-card/dd-room-card.vue'
import DdFeatureGrid from './components/dd-feature-grid/dd-feature-grid.vue'
import DdSticky from './components/dd-sticky/dd-sticky.vue'

// === Display (16) ===
import DdTag from './components/dd-tag/dd-tag.vue'
import DdStatCard from './components/dd-stat-card/dd-stat-card.vue'
import DdChampionCard from './components/dd-champion-card/dd-champion-card.vue'
import DdAvatar from './components/dd-avatar/dd-avatar.vue'
import DdBadge from './components/dd-badge/dd-badge.vue'
import DdListCell from './components/dd-list-cell/dd-list-cell.vue'
import DdCell from './components/dd-cell/dd-cell.vue'
import DdCellGroup from './components/dd-cell-group/dd-cell-group.vue'
import DdCountDown from './components/dd-count-down/dd-count-down.vue'
import DdDivider from './components/dd-divider/dd-divider.vue'
import DdImage from './components/dd-image/dd-image.vue'
import DdProgress from './components/dd-progress/dd-progress.vue'
import DdSkeleton from './components/dd-skeleton/dd-skeleton.vue'
import DdEmptyState from './components/dd-empty-state/dd-empty-state.vue'
import DdStep from './components/dd-step/dd-step.vue'
import DdSteps from './components/dd-steps/dd-steps.vue'

// === Overlay (10) ===
import DdModal from './components/dd-modal/dd-modal.vue'
import DdActionSheet from './components/dd-action-sheet/dd-action-sheet.vue'
import DdToast from './components/dd-toast/dd-toast.vue'
import DdAlert from './components/dd-alert/dd-alert.vue'
import DdLoading from './components/dd-loading/dd-loading.vue'
import DdDialog from './components/dd-dialog/dd-dialog.vue'
import DdOverlay from './components/dd-overlay/dd-overlay.vue'
import DdPopup from './components/dd-popup/dd-popup.vue'
import DdPopover from './components/dd-popover/dd-popover.vue'
import DdPopoverItem from './components/dd-popover-item/dd-popover-item.vue'

// === Interaction (5) ===
import DdSwipeAction from './components/dd-swipe-action/dd-swipe-action.vue'
import DdSwipe from './components/dd-swipe/dd-swipe.vue'
import DdSwipeItem from './components/dd-swipe-item/dd-swipe-item.vue'
import DdPullRefresh from './components/dd-pull-refresh/dd-pull-refresh.vue'
import DdLoadmore from './components/dd-loadmore/dd-loadmore.vue'

// === Mini Program (2) ===
import DdCapsuleButton from './components/dd-capsule-button/dd-capsule-button.vue'
import DdMiniProgramNavbar from './components/dd-mini-program-navbar/dd-mini-program-navbar.vue'

const components = {
  DdButton, DdInput, DdSwitch, DdCheckbox, DdRadio,
  DdSearchBar, DdSlider, DdStepper, DdDatePicker, DdField,
  DdPicker, DdRate, DdUpload, DdIcon,
  DdNavigation, DdTopNavbar, DdSegmentedTab, DdSwipeableTab,
  DdDrawer, DdTabbar, DdTabbarItem, DdBacktop,
  DdCollapse, DdCollapseItem, DdDropdownMenu, DdDropdownItem,
  DdCard, DdRoomCard, DdFeatureGrid, DdSticky,
  DdTag, DdStatCard, DdChampionCard, DdAvatar, DdBadge,
  DdListCell, DdCell, DdCellGroup, DdCountDown, DdDivider,
  DdImage, DdProgress, DdSkeleton, DdEmptyState, DdStep, DdSteps,
  DdModal, DdActionSheet, DdToast, DdAlert, DdLoading,
  DdDialog, DdOverlay, DdPopup, DdPopover, DdPopoverItem,
  DdSwipeAction, DdSwipe, DdSwipeItem, DdPullRefresh, DdLoadmore,
  DdCapsuleButton, DdMiniProgramNavbar,
}

export function install(app: App) {
  Object.entries(components).forEach(([name, comp]) => {
    app.component(name, comp)
  })
}

export default { install }

// 全量具名导出
export {
  components,
  DdButton, DdInput, DdSwitch, DdCheckbox, DdRadio,
  DdSearchBar, DdSlider, DdStepper, DdDatePicker, DdField,
  DdPicker, DdRate, DdUpload, DdIcon,
  DdNavigation, DdTopNavbar, DdSegmentedTab, DdSwipeableTab,
  DdDrawer, DdTabbar, DdTabbarItem, DdBacktop,
  DdCollapse, DdCollapseItem, DdDropdownMenu, DdDropdownItem,
  DdCard, DdRoomCard, DdFeatureGrid, DdSticky,
  DdTag, DdStatCard, DdChampionCard, DdAvatar, DdBadge,
  DdListCell, DdCell, DdCellGroup, DdCountDown, DdDivider,
  DdImage, DdProgress, DdSkeleton, DdEmptyState, DdStep, DdSteps,
  DdModal, DdActionSheet, DdToast, DdAlert, DdLoading,
  DdDialog, DdOverlay, DdPopup, DdPopover, DdPopoverItem,
  DdSwipeAction, DdSwipe, DdSwipeItem, DdPullRefresh, DdLoadmore,
  DdCapsuleButton, DdMiniProgramNavbar,
}

export * from './libs/utils'

// 图标元数据（供 demo/文档消费，与 dd-icon.vue 内 SCSS &-- 规则保持一致）
export { iconNames, iconGroups } from './components/dd-icon/dd-icon.vue'
