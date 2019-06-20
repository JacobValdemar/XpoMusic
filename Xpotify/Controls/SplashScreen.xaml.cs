﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

namespace Xpotify.Controls
{
    public sealed partial class SplashScreen : UserControl
    {
        public enum SplashScreenShowState
        {
            Visible,
            Closed,
            ClosedQuick,
        }

        #region Custom Properties
        public static readonly DependencyProperty SplashStateProperty = DependencyProperty.Register(
            "SplashState", typeof(SplashScreenShowState), typeof(SplashScreen), new PropertyMetadata(defaultValue: SplashScreenShowState.Visible,
                propertyChangedCallback: new PropertyChangedCallback(OnSplashStatePropertyChanged)));

        public SplashScreenShowState SplashState
        {
            get => (SplashScreenShowState)GetValue(SplashStateProperty);
            set
            {
                if (SplashState != value)
                    SetValue(SplashStateProperty, value);

                switch (value)
                {
                    case SplashScreenShowState.Visible:
                        VisualStateManager.GoToState(this, "SplashScreenVisible", true);
                        break;
                    case SplashScreenShowState.Closed:
                        VisualStateManager.GoToState(this, "SplashScreenClosed", true);
                        break;
                    case SplashScreenShowState.ClosedQuick:
                    default:
                        VisualStateManager.GoToState(this, "SplashScreenClosedQuick", true);
                        break;
                }
            }
        }

        private static void OnSplashStatePropertyChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            (d as SplashScreen).SplashState = (SplashScreenShowState)e.NewValue;
        }
        #endregion

        public SplashScreen()
        {
            this.InitializeComponent();
        }
    }
}