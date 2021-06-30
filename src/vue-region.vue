<script>
import { cloneDeep, isEqual } from "lodash-es";
import pcaCode from "./pca-code.json";

export default {
  name: "vue-region",
  props: {
    mode: {
      type: Array,
      default: () => ["city", "district"]
    },
    value: {
      type: Object,
      default: () => ({})
    },
    province: [String, Number],
    config: {
      type: Object,
      default: () => ({
        province: {},
        city: {},
        district: {}
      })
    },
    useName: Boolean,
    autoSelectArea: Boolean
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler() {
        if (!isEqual(this.selValList, this.value)) {
          this.selValList = cloneDeep(this.value);
        }
      }
    },
    mode: {
      immediate: true,
      handler() {
        if (!this.mode.includes("province")) {
          const provinceData = pcaCode.find(province => {
            const code = this.addCodeLen(province.code);

            return (
              code.includes(this.selValList?.province) || province.name.includes(this.province)
            );
          });

          this.dataList.province = [provinceData] || pcaCode.map(item => ({
            ...item,
            value: this.useName ? item.name : this.addCodeLen(item.code),
            label: item.name
          }));

          if (provinceData && this.mode.includes("city")) {
            if (this.selValList && !this.selValList?.province) {
              this.$set(this.selValList, "province", this.useName ? provinceData.name : this.addCodeLen(provinceData.code));
            }

            const cityList = (provinceData?.children || []).map(item => ({
              ...item,
              value: this.useName ? item.name : this.addCodeLen(item.code),
              label: item.name
            }));

            this.$set(this.dataList, "city", cityList);
          }
        }
      }
    },
    selValList: {
      immediate: true,
      deep: true,
      handler(newObj, oldObj) {
        const isChangeCity = (newObj && this.value && newObj?.city !== this.value?.city) || (newObj.city && !oldObj);

        if (isChangeCity && this.mode.includes("district")) {
          const city = this.dataList.city.find(city => {
            const code = this.addCodeLen(city.code);
            return this.useName ? city.name === newObj.city : code.includes(newObj.city);
          });

          const districtList = (city?.children || []).map(item => {
            return {
              ...item,
              value: this.useName ? item.name : this.addCodeLen(item.code),
              label: item.name
            }
          });
          this.$set(this.dataList, "district", districtList);

          // 是否切换城市（tips: 需要处理初始化存在地市的问题）
          if (oldObj?.city || (!newObj?.city && !oldObj?.city)) {
            this.$set(this.selValList, "district", "");
          } 
          
          if(this.autoSelectArea && !this.selValList['district']) {
            this.$set(this.selValList, "district", this.dataList['district']?.[0]?.value);
          }
        }

        this.$emit("input", cloneDeep(newObj));

        const selectedObj = {};

        for(const key of Object.keys(newObj)) {
          selectedObj[key] = this.dataList[key]?.find(data => newObj[key] === data.value) ?? {};
        }

        this.$emit('selected-obj', selectedObj);
      }
    },
  },
  methods: {
    addCodeLen(code) {
      const str = String(code);
      const len = 6 - str.length;

      if (len > 0) {
        const extStr = Array(len + 1).join("0");

        return str + extStr;
      }

      return code;
    },
    getItemProps(item, prefix) {
      return item?.[prefix + 'Props'] || {};
    },
    getItemOn(item, prefix) {
      return item?.[prefix + 'On'] || {};
    },
  },
  data() {
    return {
      selValList: {},
      dataList: {
        province: [],
        city: [],
        district: []
      }
    };
  },
  render () {
    return <el-row class="region" v-bind="$attrs" v-on="$listeners">
      {
        this.modes?.map((mode) => {
          return <el-col v-bind="getItemProps(config[item], 'col')" v-on="getItemOn(config[item], 'col')" span={24 / this.modes?.length}>
            <el-select value={this.selValList[mode]} onInput={
              val => this.selValList[mode] = val
            } v-bind="getItemProps(config[item], 'sel')" v-on="getItemOn(config[item], 'sel')"  clearable placeholder={
              '请选择' + (mode === 'district' ? '区/县' : mode === 'city' ? '市' : '省')
            } >
              {
                this.dataList[mode]?.map((subItem) => {
                  return <el-option v-bind={subItem}>
                  </el-option>
                })
              }
            </el-select>
          </el-col>
        })
      }
    </el-row>
  }
};
</script>
