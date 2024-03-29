/*
Copyright 2016 Capital One Services, LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

SPDX-Copyright: Copyright (c) Capital One Services, LLC
SPDX-License-Identifier: Apache-2.0
*/

import React,{Component} from 'react'
import {Text as ReactText}  from 'react-native'
import Svg,{ G, Path, Text } from 'react-native-svg'
import { Colors, Options, fontAdapt, cyclic, color, identity } from './util'
import _ from 'lodash'
import Axis from './Axis'
const Bar = require('paths-js/bar')
import 'babel-polyfill'

export default class BarChart extends Component {

  static defaultProps = {
    accessorKey:'',
    options: {
      width: 600,
      height: 160,
      margin: {top: 20, left: 20, bottom: 50, right: 20},
      color: '#2a97ff',
      gutter: 20,
      animate: {
        type: 'oneByOne',
        duration: 200,
        fillTransition: 3
      },
      axisX: {
        showAxis: true,
        showLines: true,
        showLabels: true,
        showTicks: true,
        zeroAxis: false,
        orient: 'bottom',
        label: {
          fontFamily: 'Arial',
          fontSize: 14,
          bold: true,
          color: '#5b5c60'
        }
      },
      axisY: {
        min: false,
        max: false,
        showAxis: true,
        showLines: true,
        showLabels: true,
        showTicks: true,
        zeroAxis: false,
        orient: 'left',
        label: {
          fontFamily: 'Arial',
          fontSize: 14,
          bold: true,
          color: '#5b5c60'
        }
      }
    }
  }

  color(i) {
    let color = this.props.options.color
    if (!_.isString(this.props.options.color)) color = color.color
    const pallete = this.props.pallete || Colors.mix(color || '#9ac7f7')
    // Changed return
    // return Colors.string(cyclic(pallete, i))
    return color
  }

  getMaxAndMin(values, scale) {
    const axisY = this.props.options.axisY
		let maxValue = axisY.max || 0
		let minValue = axisY.min || 0

    let max = _.max(values)
    if (max > maxValue) maxValue = max
    let min = _.min(values)
    if (min < minValue) minValue = min

    return {
      minValue: minValue,
      maxValue: maxValue,
      min: scale(minValue),
      max: scale(maxValue)
    }
  }

  render() {
    const noDataMsg = this.props.noDataMessage || 'No data available'
    if (this.props.data === undefined) return (<ReactText>{noDataMsg}</ReactText>)

    let options = new Options(this.props)
    let accessor = this.props.accessor || identity(this.props.accessorKey)

    let chart = Bar({
      data: this.props.data,
      gutter: this.props.options.gutter || 10,
      width: options.chartWidth,
      height: options.chartHeight,
      accessor: accessor,
      min: this.props.options.axisY.min || undefined,
      max: this.props.options.axisY.max || undefined,
    })

    let values = chart.curves.map((curve) => accessor(curve.item))

    let chartArea = {x: {minValue: 0, maxValue: 200, min: 0, max: options.chartWidth},
                     y: this.getMaxAndMin(values, chart.scale),
                     margin:options.margin}
    let textStyle = fontAdapt(options.axisX.label)

    let lines = chart.curves.map(function (c, i) {

      let color = this.color(i % 3)
      let stroke = color;
      return (
                <G key={'lines' + i}>
                    <Path  d={ c.line.path.print() } stroke={stroke} fill={color}/>
                    {options.axisX.showLabels ?
                        <G x={0} y={8}>
                          <Text fontFamily={textStyle.fontFamily}
                                fontSize={textStyle.fontSize}
                                fontWeight={textStyle.fontWeight}
                                fontStyle={textStyle.fontStyle}
                                fill={textStyle.fill}
                                x={c.line.centroid[0]}
                                y={chartArea.y.min}
                                rotate={0}
                                textAnchor="middle"> {c.item.name}</Text>
                        </G>
                        :null}
                </G>
            )

    }, this)

    return (<Svg width={options.width} height={options.height}>
              <G x={options.margin.left} y={options.margin.top}>
                <Axis scale={chart.scale} options={options.axisY} chartArea={chartArea} />
                {lines}
              </G>
            </Svg>)
  }
}
